import { v4 as uuidv4 } from 'uuid';

import { Server, StableBTreeMap, ic } from 'azle';

import express from 'express';

class PiecePrice {
    id:string;
    size:number;
    price:number;
    constructor(size: number, price: number){
        this.id = uuidv4();
        this.size = size;
        this.price = size;
    }
}

class MaterialType {
    id: string;
    name:string;
    description: string;
    constructor(name: string, description: string){
        this.id = uuidv4();
        this.name = name;
        this.description = description;
    }
}


const MaterialTypeStorage = StableBTreeMap<string, MaterialType>(0);
const PiecePriceStorage = StableBTreeMap<string, PiecePrice>(1);



