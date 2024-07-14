import { v4 as uuidv4 } from 'uuid';

import { Server, StableBTreeMap, ic } from 'azle';

import express from 'express';


class PiecePrice {
    /**
     * Represents the price information for a material piece.
     * @param {string} materialTypeId - The ID of the material type.
     * @param {{ size: number; price: number }[]} prices - The array of size and price objects.
     */
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

    /**
     * Updates the price for a specific size.
     * @param {number} size - The size of the piece.
     * @param {number} price - The new price for the specified size.
     * @param {boolean} tag - Flag indicating if a new price entry should be added.
     * @returns {boolean} - True if the price was updated or added, otherwise false.
     */
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
    /**
     * Represents a material type.
     * @param {string} name - The name of the material type.
     * @param {string} description - The description of the material type.
     */
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

    /**
     * Registers a new material.
     * @route POST /register-material
     * @param {Object} req - Express request object.
     * @param {string} req.body.name - Name of the material.
     * @param {string} req.body.description - Description of the material.
     * @param {Object} res - Express response object.
     * @returns {Object} 200 - Material registered successfully.
     * @returns {Object} 400 - Missing required fields.
     * @returns {Object} 409 - Material already exists.
     */

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
    
    /**
     * Registers prices for a material.
     * @route POST /register-material-prices/:id
     * @param {Object} req - Express request object.
     * @param {string} req.params.id - Material ID.
     * @param {Array} req.body - Array of prices.
     * @param {Object} res - Express response object.
     * @returns {Object} 200 - Prices added successfully.
     * @returns {Object} 400 - Missing required fields.
     * @returns {Object} 409 - Prices for material already exist.
     */
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

    /**
     * Retrieves all materials.
     * @route GET /materials
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @returns {Object} 200 - List of materials.
     * @returns {Object} 404 - Materials not found.
     */
    app.get('/materials', (req, res) => {
        const materials = MaterialTypeStorage.values();
        if(!materials){
            res.status(404).json({ message: "Material not found" });
        }else{
            res.status(200).json(materials);
        }
    });

    /**
     * Retrieves a specific material by ID.
     * @route GET /materials/:id
     * @param {Object} req - Express request object.
     * @param {string} req.params.id - Material ID.
     * @param {Object} res - Express response object.
     * @returns {Object} 200 - Material found.
     * @returns {Object} 404 - Material not found.
     */
    app.get('/materials/:id', (req, res) => {

        const materialID = req.params.id;
        
        const materials = MaterialTypeStorage.values().find(p => p.id === materialID);
        
        if(!materials){
            res.status(404).json({ message: "Material not found" });
        }else{
            res.status(200).json(materials);
        }
    });

    /**
     * Retrieves piece prices for a material.
     * @route GET /materials/:id/piece-prices
     * @param {Object} req - Express request object.
     * @param {string} req.params.id - Material ID.
     * @param {Object} res - Express response object.
     * @returns {Object} 200 - Piece prices found.
     * @returns {Object} 400 - Invalid material ID or material not found.
     * @returns {Object} 404 - Prices not found.
     */
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

    /**
     * Deletes a material and its piece prices.
     * @route DELETE /remove/material/:id
     * @param {Object} req - Express request object.
     * @param {string} req.params.id - Material ID.
     * @param {Object} res - Express response object.
     * @returns {Object} 200 - Material deleted successfully.
     * @returns {Object} 400 - Couldn't delete the material, not found.
     */
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

    /**
     * Updates a piece price for a material.
     * @route PUT /update/material/:id/piece
     * @param {Object} req - Express request object.
     * @param {string} req.params.id - Material ID.
     * @param {number} req.body.size - Size of the piece.
     * @param {number} req.body.price - New price for the specified size.
     * @param {Object} res - Express response object.
     * @returns {Object} 200 - Piece price updated successfully.
     * @returns {Object} 400 - Couldn't find the material or piece price.
     */
    app.post('/update/material/:id/piece', (req, res) => {
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

    /**
     * Adds a new piece price for a material.
     * @route PUT /add/material/:id/piece
     * @param {Object} req - Express request object.
     * @param {string} req.params.id - Material ID.
     * @param {number} req.body.size - Size of the piece.
     * @param {number} req.body.price - New price for the specified size.
     * @param {Object} res - Express response object.
     * @returns {Object} 200 - Piece price added successfully.
     * @returns {Object} 400 - Couldn't find the material or piece price.
     */ 
    app.post('/add/material/:id/piece', (req, res) => {
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

    /**
     * Computes the optimal cuts to maximize profit.
     * @route PUT /material/:id/optimize-cuts/:length
     * @param {Object} req - Express request object.
     * @param {string} req.params.id - Material ID.
     * @param {string} req.params.length - Length of the material.
     * @param {Object} res - Express response object.
     * @returns {Object} 200 - Optimized cuts calculated successfully.
     * @returns {Object} 400 - Couldn't find the material or material prices.
     */
    app.get('/material/:id/optimize-cuts/:length', (req, res) => {
        
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


/**
 * Gets the current date.
 * @returns {Date} - The current date.
 */
function getCurrentDate() {

    const timestamp = new Number(ic.time());

    return new Date(timestamp.valueOf() / 1000_000);

}

/**
 * Updates the price of a piece for a specific material type.
 * @param {string} materialTypeId - The ID of the material type.
 * @param {number} size - The size of the piece.
 * @param {number} newPrice - The new price for the specified size.
 * @param {boolean} addPiece - Flag indicating if a new price entry should be added.
 * @returns {boolean} - True if the price was updated or added, otherwise false.
 */
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

/**
 * Computes the optimal cuts to maximize profit given the piece prices and length.
 * @param {{ size: number; price: number }[]} prices - The array of size and price objects.
 * @param {number} n - The length of the material.
 * @returns {{ maxProfit: number, cuts: number[] }} - The maximum profit and the array of cuts.
 */
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






