import { v4 as uuidv4 } from 'uuid';

import { Server, StableBTreeMap, ic } from 'azle';

import express from 'express';


class PiecePrice {
    id:string;
    materialTypeId: string;
    createdAt: Date;
    prices: { size: number; price: number }[];

    constructor(materialTypeId: string, prices: { size: number; price: number }[]) {
        this.id = uuidv4();
        this.materialTypeId = materialTypeId;
        this.prices = prices;
        this.createdAt = getCurrentDate();
    }

    // Method to update the price for a specific size
    updatePrice(size: number, price: number, tag:boolean): boolean {
        if(tag){
           this.prices.push({size,price});
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
    name:string;
    description: string;
    createdAt: Date;
    constructor(name: string, description: string){
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

    //Regeister a new material
    app.post('/register-material', (req, res) => {

        const {name , description} = req.body

        if(name === undefined){
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const material = new MaterialType(name,description);
        if(!MaterialTypeStorage.values().find(p => p.name === name)){
            //insert the material into the tree
            MaterialTypeStorage.insert(material.id,material)
            res.status(200).json({ message: 'Material Regisstered successfully',
                materialID: MaterialTypeStorage.values().find(p => name)?.id,
                materialName: MaterialTypeStorage.values().find(p => name)?.name
            });
            
        }else {
            res.status(409).json({error: "Material you are registering already exists",
                materialID: MaterialTypeStorage.values().find(p => name)?.id,
                materialName: MaterialTypeStorage.values().find(p => name)?.name
            })
        }
     

    });
    
    // registering the piece prices

    app.post('/register-material-prices/:id', (req, res) => {
        
        const materialID = req.params.id;
        const prices = req.body;
        if(prices === undefined){
            return res.status(400).json({ error: 'Missing required fields prices' });
        }
        
        
        const materialObject = PiecePriceStorage.values().find(p => p.materialTypeId === materialID);
        if(materialObject){
            res.status(409).json({error: "Prices for Material already exists", 
            prices:materialObject?.prices});
        }else{
            const piecePriceObject = new PiecePrice(materialID,prices);
            PiecePriceStorage.insert(piecePriceObject.id,piecePriceObject);
            res.status(200).json({message: "The price for pieces were succefully added",
                body:piecePriceObject.prices
            });
        }
    });

    // now we are displaying all the materials.
    app.get('/materials', (req, res) => {
        const materials = MaterialTypeStorage.values();
        if(!materials){
            res.status(404).json({ message: "Material not found" });
        }else{
            res.status(200).json(materials);
        }
    });

    app.get('/materials/:id', (req, res) => {

        const materialID = req.params.id;
        
        const materials = MaterialTypeStorage.values().find(p => p.id === materialID);
        
        if(!materials){
            res.status(404).json({ message: "Material not found" });
        }else{
            res.status(200).json(materials);
        }
    });

    // now we are posting piece prices with
    app.get('/materials/:id/piece-prices', (req, res) => {

        const materialID = req.params.id;

        if(MaterialTypeStorage.values().find(p => p.id === materialID)){
            return res.status(400).json({ error: 'Invalid material ID or Material not found' });
        }

        const prices = PiecePriceStorage.values().find(p => p.id === materialID);
        const materials = MaterialTypeStorage.values().find(p => p.id === materialID);

        if(!prices){
            res.status(404).json({ message: "Prices not found" });
        }else{
            res.status(200).json({name: materials?.name,
                description: materials?.description,
                prices: prices.prices
            })
        }
    });

    // now we are deleting a material
    app.delete('/remove/material/:id', (req, res) => {

        const materialID = req.params.id;
        const deletedMaterial = MaterialTypeStorage.remove(materialID);
        const pieceID = PiecePriceStorage.values().find(p => p.materialTypeId === materialID);
        
        if(pieceID){
            PiecePriceStorage.remove(pieceID?.id);
        }
        
        if ("None" in deletedMaterial) {
 
            res.status(400).send(`couldn't delete a material with id=${materialID}. material not found`);
      
         } else {
      
            res.json(deletedMaterial.Some);
      
         }
    
    });

    // now we are up-dating a piece price 
    app.put('/update/material/:id/piece', (req, res) => {
        const materialID = req.params.id;
        const {size, price} = req.body;

        if(PiecePriceStorage.values().find(p => p.materialTypeId === materialID)){
            res.status(400).send(`couldn't find a material with ID=${materialID}. material not found`);
        }

        if(updatePiecePrice(materialID, size, price,false)){
            res.status(200).json(PiecePriceStorage.values().find(p => p.materialTypeId === materialID));
        }else{
            res.status(400).send(`couldn't update a piece price with materialID=${materialID}. piece price not found`);
        }
    
    });

    // now we are adding a piece price 
    app.put('/add/material/:id/piece', (req, res) => {
        const materialID = req.params.id;
        const {size, price} = req.body;

        if(PiecePriceStorage.values().find(p => p.materialTypeId === materialID)){
            res.status(400).send(`couldn't find a material with ID=${materialID}. material not found`);
        }

        if(updatePiecePrice(materialID, size, price,true)){
            res.status(200).json(PiecePriceStorage.values().find(p => p.materialTypeId === materialID));
        }else{
            res.status(400).send(`couldn't add a piece price with materialID=${materialID}. piece price not found`);
        }
    });

    // now we are computing
    app.put('/material/:id/optimize-cuts/:length', (req, res) => {
        
        const materialID = req.params.id;
        const materialLength = req.params.length;

        const materialExists = MaterialTypeStorage.values().find(p => p.id === materialID);
        const pricesExist = PiecePriceStorage.values().find(p => p.materialTypeId === materialID);

        if(materialExists){
            if(pricesExist){

                const results = cutting(pricesExist.prices,parseInt(materialLength))
                res.status(200).json({material:materialExists.name,
                    description: materialExists.description,
                    results: results
                });

            }else{

                res.status(400).send(`couldn't find material prices with ID=${materialID}. material prices not found`);
            }
        }else{

            res.status(400).send(`couldn't find a material with ID=${materialID}. material not found`);
        }

    });

    return app.listen();

});


function getCurrentDate() {

    const timestamp = new Number(ic.time());

    return new Date(timestamp.valueOf() / 1000_000);

}

function updatePiecePrice(materialTypeId: string, size: number, newPrice: number, addPiece: boolean): boolean {

    if (addPiece){
        const piecePricesObject = PiecePriceStorage.values().find(p => p.materialTypeId === materialTypeId);
    }
    const piecePricesObject = PiecePriceStorage.values().find(p => p.materialTypeId === materialTypeId);
    if (piecePricesObject) {
        const updated = piecePricesObject.updatePrice(size, newPrice,false);
        if (updated) {
            PiecePriceStorage.insert(piecePricesObject.id, piecePricesObject);
            return true;
        }
    }
    return false;
}

function cutting(prices: { size: number; price: number }[], n: number): { maxProfit: number, cuts: number[] } {
    // Create a price map for easier access
    const priceMap = new Map<number, number>();
    for (const priceObj of prices) {
        priceMap.set(priceObj.size, priceObj.price);
    }

    const memo: number[] = new Array(n + 1).fill(-1);
    const cutsMemo: number[] = new Array(n + 1).fill(-1);

    function maxProfit(length: number): number {
        if (length === 0) return 0;
        if (memo[length] !== -1) return memo[length];

        let maxVal = Number.MIN_SAFE_INTEGER;
        for (const size of priceMap.keys()) {
            if (size <= length) {
                const currentProfit = priceMap.get(size)! + maxProfit(length - size);
                if (maxVal < currentProfit) {
                    maxVal = currentProfit;
                    cutsMemo[length] = size;
                }
            }
        }

        memo[length] = maxVal;
        return maxVal;
    }

    const maxProfitValue = maxProfit(n);

    // Reconstruct the cuts
    const lengths: number[] = [];
    let length = n;
    while (length > 0) {
        lengths.push(cutsMemo[length]);
        length -= cutsMemo[length];
    }

    return { maxProfit: maxProfitValue, cuts: lengths };
}






