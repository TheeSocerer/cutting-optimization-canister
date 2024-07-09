# Cutting Optimization Canister API Documentation

## Introduction
The Cutting Optimization Canister API is a specialized tool designed for businesses involved in the sale and production of rod-like products. It leverages smart contracts on the Internet Computer (ICP) platform to provide efficient management of materials and pricing information. This API enables businesses to optimize the cutting of materials to maximize profit margins while minimizing waste. Key features include the ability to add and delete materials, manage prices per length or piece, and perform advanced calculations for cutting optimization. By integrating with smart contracts, the API ensures transparency, security, and automation in managing materials and conducting optimization tasks. It caters specifically to businesses seeking to enhance operational efficiency and profitability in the management of 1D materials such as rods.

## Purpose and Features:
### Material Management: Allows users to manage various materials used in production, likely specifying attributes such as type of material and associated prices.

### Price Management:
Enables linking materials with their respective prices per length or piece. This feature helps in calculating costs and profits based on the dimensions of the rods or similar products.

### Optimization Calculations: 
Performs calculations to optimize the cutting of materials to maximize profit. This involves finding the most efficient way to cut rods or similar items from longer pieces, minimizing waste and maximizing the yield.

### Smart Contracts on the ICP: 
Indicates that the API utilizes smart contracts on the Internet Computer (ICP). Smart contracts provide transparency, security, and automation of transactions and operations related to material management and optimization.

## Functionality Overview:
### Adding Materials:
Users can add new materials to the system and link them with their corresponding prices. This allows the API to dynamically adjust calculations based on the current pricing information.

### Deleting Materials:
Provides an endpoint to remove materials from the system. This could be useful for updating inventory or when materials are no longer in use.

### Calculation of Maximum Profit:
By integrating the price information with optimization algorithms, the API helps businesses determine the best way to cut materials to achieve maximum profitability.

## Target Audience:
### Businesses Selling Rod-like Products:
Primarily targets businesses that manufacture or sell rod-shaped materials where efficient use of materials and accurate cost calculations are critical.

## Tech Stack

Here are the key technologies and tools we'll be using:

- Internet Computer Protocol (ICP): ICP is a decentralized computing platform that facilitates the creation of software, computation, and data that can run on the public internet. It's the platform we'll be building our application on.
- Azle: Azle is a TypeScript framework for creating and managing smart contracts, or "canisters," on the Internet Computer Protocol (ICP).
- Node.js: Node.js is a JavaScript runtime that allows for the execution of JavaScript outside of a web browser. We'll be using Node.js version 18 for this tutorial.
- Node Version Manager (nvm): Nvm is a tool that enables management and switching between different Node.js versions. We'll be using it to manage our Node.js environment.
- DFX: DFX is the command-line interface for the Internet Computer. We'll be using it to create and manage our Azle project.
- TypeScript: TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. We'll be using it for writing our application's code, and our project will include a configuration file (tsconfig.json) for setting up the TypeScript compiler options.
- Candid: Candid is an interface description language (IDL) used by Internet Computer for defining and describing the public interfaces of services, i.e., their methods and their input/output types. We'll be using Candid in our project to describe the interface of our canisters.
 

## Benefits:
### Cost Efficiency:
Helps businesses reduce material wastage through optimized cutting strategies.
### Profit Maximization: 
Provides tools to maximize profit margins by considering both material costs and optimal cutting patterns.
### Scalability and Flexibility:
Can adapt to different types of rod-like materials and varying pricing structures.

## Getting Started
To run the Cutting Optimization Canister API, follow these steps:

1. Clone the repository.
    ```sh
    git clone https://github.com/TheeSocerer/cutting-optimization-canister.git
    ```
2. Install the project's dependencies by running:.
    ```sh
    npm install
    ```
3. Start the DFX server:
   ```sh
   dfx start --host 127.0.0.1:8000 --clean
   ```
4. In another terminal, deploy the canister:
    ```sh
    dfx deploy
    ```
5. get the canister ID:
    ```sh
    dfx canister id <CANISTER_NAME>
    ```
<CANINSTER_NAME> is the name of your canister


## Endpoints

    - [/register-material](#register-material)
    - [/register-material-prices/:id](#register-material-pricesid)
    - [/materials](#retrieve-all-materials)
    - [/materials/:id](#retrieve-a-material)
    - [/materials/:id/piece-prices](#retrieve-piece-prices)
    - [/remove/material/:id](#delete-a-material)
    - [/update/material/:id/piece](#update-a-piece-price)
    - [/add/material/:id/piece](#add-a-piece-price)
    - [/material/:id/optimize-cuts/:length](#optimize-cuts)

## Endpoints Usage

### 1. Register a Material

    To Register a new material.

        URL: `/register-material`
        Method: POST
        Headers: Content-Type: application/json
        Body Parameters:
            name (string): Name of the material.
            description (string): Description of the material.

#### Request Example:

```sh
curl -X POST http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/register-material -H "Content-Type: application/json" -d '{"name":"steel rod","description":"this is a very thin steel used for construction. mainly foundation"}'
```

#### Response

```sh
{"message":"Material Regisstered successfully","materialID":"b5534879-cc3d-4a3e-b247-4f42e10dd788","materialName":"steel rod"}
```
    200 OK - Material Regisstered successfully.
    400 Bad Request - Missing required fields.
    409 Conflict - Material you are registering already exists

### 2. Register a Material

    To update a piece price in a list of prices of a certain material.

        URL: `/update/material/:id/piece`
        Method: PUT
        Headers: Content-Type: application/json
        Body Parameters:
            size (string): size of the material (int)
            price (string): price of the material (int)

### Request Example:

```sh
curl -X POST http://127.0.0.1:8000//update/material/:id/piece -H "Content-Type: application/json" -d '{"size": 1,"price": 12}'
```
    `id` is the `id` of the material you're updating the price for

### Response

    200 OK - price Updated successfully.
    400 Bad Request - Missing required fields.
    409 Conflict - Price for the material already exists

### 3. Register  piece prices

    To register piece prices for a certain material.

        URL: `/register-material-prices/:id`
        Method: PUT
        Headers: Content-Type: application/json
        Body Parameters:
            prices (string): { size: number; price: number }[]

### Request Example:

```sh
curl -X POST http://br5f7-7uaaa-aaaaa-qaaca-cai.localhost:8000/register-material-prices/b5534879-cc3d-4a3e-b247-4f42e10dd788 -H "Content-type: application/json" -d '{"prices":[{ size: 3, price: 9 },{ size: 6, price: 13 },{ size: 5, price: 11 },{ size: 2, price: 5 }]}'
```
    `id` is the `id` of the material you're registering the prices for

### Response

```sh
{"message":"Material Regisstered successfully","materialID":"b5534879-cc3d-4a3e-b247-4f42e10dd788","materialName":"steel rod"}
```
    200 OK - prices updated successfully.
    400 Bad Request - Missing required fields.
    409 Conflict - prices for the material already exists

## Contributing

Contributions to the project are welcome. If you'd like to contribute, please fork the repository, create a new branch, make your changes, and submit a pull request.

## Support

For any inquiries or support, please contact [tshepo](shiburitshepo04@gmail.com).


## License

MIT License

Copyright (c) 2024 [Theesocerer/tsheposhiburi]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

