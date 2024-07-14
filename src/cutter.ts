import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express, { Request, Response } from 'express';
import cors from 'cors';

class PiecePrice {
    id: string;
    materialTypeId: string;
    createdAt: Date;
    prices: { size: number; price: number }[];

    constructor(materialTypeId: string, prices: { size: number; price: number }[]) {
        this.id = uuidv4();
        this.materialTypeId = materialTypeId;
        this.prices = prices;
        this.createdAt = getCurrentDate();
    }

    updatePrice(size: number, price: number, addNew: boolean): boolean {
        if (addNew) {
            this.prices.push({ size, price });
            return true;
        }
        const priceEntry = this.prices.find(p => p.size === size);
        if (priceEntry) {
            priceEntry.price = price;
            return true;
        }
        return false;
    }
}

class MaterialType {
    id: string;
    name: string;
    description: string;
    createdAt: Date;

    constructor(name: string, description: string) {
        this.id = uuidv4();
        this.name = name;
        this.description = description;
        this.createdAt = getCurrentDate();
    }
}

const MaterialTypeStorage = StableBTreeMap<string, MaterialType>(0);
const PiecePriceStorage = StableBTreeMap<string, PiecePrice>(1);

export default Server(() => {
    const app = express();
    app.use(express.json());
    app.use(cors());

    app.post('/register-material', (req: Request, res: Response) => {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (MaterialTypeStorage.values().some(p => p.name === name)) {
            const existingMaterial = MaterialTypeStorage.values().find(p => p.name === name);
            return res.status(409).json({
                error: 'Material already exists',
                materialID: existingMaterial?.id,
                materialName: existingMaterial?.name
            });
        }

        const material = new MaterialType(name, description);
        MaterialTypeStorage.insert(material.id, material);
        res.status(200).json({
            message: 'Material registered successfully',
            materialID: material.id,
            materialName: material.name
        });
    });

    app.post('/register-material-prices/:id', (req: Request, res: Response) => {
        const materialID = req.params.id;
        const prices = req.body;

        if (!Array.isArray(prices) || prices.some(p => typeof p.size !== 'number' || typeof p.price !== 'number')) {
            return res.status(400).json({ error: 'Invalid prices format' });
        }

        if (!MaterialTypeStorage.values().some(p => p.id === materialID)) {
            return res.status(404).json({ error: 'Material not found' });
        }

        if (PiecePriceStorage.values().some(p => p.materialTypeId === materialID)) {
            return res.status(409).json({
                error: 'Prices for material already exist',
                prices: PiecePriceStorage.values().find(p => p.materialTypeId === materialID)?.prices
            });
        }

        const piecePrice = new PiecePrice(materialID, prices);
        PiecePriceStorage.insert(piecePrice.id, piecePrice);
        res.status(200).json({
            message: 'Prices registered successfully',
            prices: piecePrice.prices
        });
    });

    app.get('/materials', (req: Request, res: Response) => {
        const materials = MaterialTypeStorage.values();
        if (!materials.length) {
            return res.status(404).json({ message: 'No materials found' });
        }
        res.status(200).json(materials);
    });

    app.get('/materials/:id', (req: Request, res: Response) => {
        const materialID = req.params.id;
        const material = MaterialTypeStorage.values().find(p => p.id === materialID);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }
        res.status(200).json(material);
    });

    app.get('/materials/:id/piece-prices', (req: Request, res: Response) => {
        const materialID = req.params.id;
        const material = MaterialTypeStorage.values().find(p => p.id === materialID);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        const piecePrices = PiecePriceStorage.values().find(p => p.materialTypeId === materialID);
        if (!piecePrices) {
            return res.status(404).json({ message: 'Piece prices not found' });
        }

        res.status(200).json({
            name: material.name,
            description: material.description,
            prices: piecePrices.prices
        });
    });

    app.delete('/remove/material/:id', (req: Request, res: Response) => {
        const materialID = req.params.id;

        const material = MaterialTypeStorage.remove(materialID);
        const piecePrice = PiecePriceStorage.values().find(p => p.materialTypeId === materialID);
        if (piecePrice) {
            PiecePriceStorage.remove(piecePrice.id);
        }

        if ("None" in material) {
            return res.status(404).json({ message: `Material with ID=${materialID} not found` });
        }

        res.status(200).json(material.Some);
    });

    app.put('/update/material/:id/piece', (req: Request, res: Response) => {
        const materialID = req.params.id;
        const { size, price } = req.body;

        if (typeof size !== 'number' || typeof price !== 'number') {
            return res.status(400).json({ error: 'Invalid size or price' });
        }

        const piecePrice = PiecePriceStorage.values().find(p => p.materialTypeId === materialID);
        if (!piecePrice) {
            return res.status(404).json({ message: 'Piece prices not found' });
        }

        piecePrice.updatePrice(size, price, false);
        PiecePriceStorage.insert(piecePrice.id, piecePrice);
        res.status(200).json(piecePrice);
    });

    app.put('/add/material/:id/piece', (req: Request, res: Response) => {

        const materialID = req.params.id;
        const { size, price } = req.body;

        if (typeof size !== 'number' || typeof price !== 'number') {
            return res.status(400).json({ error: 'Invalid size or price' });
        }

        const piecePrice = PiecePriceStorage.values().find(p => p.materialTypeId === materialID);
        if (!piecePrice) {
            return res.status(404).json({ message: 'Piece prices not found' });
        }

        piecePrice.updatePrice(size, price, true);
        PiecePriceStorage.insert(piecePrice.id, piecePrice);
        res.status(200).json(piecePrice);
    });

    app.put('/material/:id/optimize-cuts/:length', (req: Request, res: Response) => {
        const materialID = req.params.id;
        const materialLength = parseInt(req.params.length);

        const material = MaterialTypeStorage.values().find(p => p.id === materialID);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        const piecePrices = PiecePriceStorage.values().find(p => p.materialTypeId === materialID);
        if (!piecePrices) {
            return res.status(404).json({ message: 'Piece prices not found' });
        }

        const results = optimizeCuts(piecePrices.prices, materialLength);
        res.status(200).json({
            material: material.name,
            description: material.description,
            results: results
        });
    });

    return app.listen();
});

function getCurrentDate(): Date {
    const timestamp = Number(ic.time());
    return new Date(timestamp / 1000_000);
}

function updatePiecePrice(materialTypeId: string, size: number, newPrice: number, addPiece: boolean): boolean {
    const piecePrice = PiecePriceStorage.values().find(p => p.materialTypeId === materialTypeId);
    if (piecePrice) {
        const updated = piecePrice.updatePrice(size, newPrice, addPiece);
        if (updated) {
            PiecePriceStorage.insert(piecePrice.id, piecePrice);
            return true;
        }
    }
    return false;
}

function optimizeCuts(prices: { size: number; price: number }[], length: number): { maxProfit: number, cuts: number[] } {
    const priceMap = new Map<number, number>();
    for (const priceObj of prices) {
        priceMap.set(priceObj.size, priceObj.price);
    }

    const memo: number[] = new Array(length + 1).fill(-1);
    const cutsMemo: number[] = new Array(length + 1).fill(-1);

    function maxProfit(n: number): number {
        if (n === 0) return 0;
        if (memo[n] !== -1) return memo[n];

        let maxVal = Number.MIN_SAFE_INTEGER;
        for (const [size, price] of priceMap.entries()) {
            if (size <= n) {
                const currentProfit = price + maxProfit(n - size);
                if (maxVal < currentProfit) {
                    maxVal = currentProfit;
                    cutsMemo[n] = size;
                }
            }
        }

        memo[n] = maxVal;
        return maxVal;
    }

    const maxProfitValue = maxProfit(length);

    const cuts: number[] = [];
    let remainingLength = length;
    while (remainingLength > 0) {
        cuts.push(cutsMemo[remainingLength]);
        remainingLength -= cutsMemo[remainingLength];
    }

    return { maxProfit: maxProfitValue, cuts };
}
