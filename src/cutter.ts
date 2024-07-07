import { v4 as uuidv4 } from 'uuid';

import { Server, StableBTreeMap, ic } from 'azle';

import express from 'express';


class PiecePrice {
    id:string;
    materialTypeId: string;
    prices: { size: number; price: number }[];

    constructor(materialTypeId: string, prices: { size: number; price: number }[]) {
        this.id = uuidv4();
        this.materialTypeId = materialTypeId;
        this.prices = prices;
    }

    // Method to update the price for a specific size
    updatePrice(size: number, newPrice: number): boolean {
        const priceEntry = this.prices.find(p => p.size === size);
        if (priceEntry) {
            priceEntry.price = newPrice;
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
        this.createdAt = getCurrentFate();
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
        if(materials){
            res.status(404).json({ message: "Material not found" });
        }else{
            res.status(200).json(materials);
        }
    });

    app.get('/materials/:id', (req, res) => {

        const materialID = req.params.id;
        const materials = MaterialTypeStorage.values().find(p => p.id === materialID);
        
        if(materials){
            res.status(404).json({ message: "Material not found" });
        }else{
            res.status(200).json(materials);
        }
    });
