import subprocess
import os
import time
import requests

CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai"
url_canister = "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000/"

def run_command(command, background=False):
    try:
        if background:
            process = subprocess.Popen(command, shell=True, cwd=os.getcwd(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            return process
        else:
            result = subprocess.run(command, capture_output=True, text=True, check=True, shell=True, cwd=os.getcwd())
            return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"An error occurred: {e}")
        return None

def process_output(output):
    lines = output.split('\n')
    # Example task: Counting the number of lines
    line_count = len(lines)
    print(f"Number of lines: {line_count}")

    # Example task: Printing the first line
    if lines:
        print(f"First line: {lines[0]}")
        
def register_material():
    name = ''
    description = ''
    while(True):
        name = input("please enter the name of the material:")
        description = input("please enter the description of the material:")
        if(name.isalpha() and len(name)!=0):
            break
    return make_api_request(url_canister,"POST",{"name":name,"description":description})

def register_material_prices():
    pass
def get_materials():
    pass
def get_one_material():
    pass
def get_material_prices():
    pass
def update_material_piece():
    pass
def add_material_piece():
    pass
def optimize():
    pass
def delete_material():
    pass
def delete_prices():
    pass

def process_the_requests(command):
    
    if "/register-material" in command:
        return register_material()
    elif "/register-material-prices/" in command:
        return register_material_prices()
    elif "/materials" in command and "/materials/" not in command:
        return get_materials()
    elif "/material" in command and "/piece-prices" not in command:
        return get_one_material()
    elif "/materials/" in command and "/piece-prices" in command:
        print("Retrieving piece prices...")
        return get_material_prices()
    elif "/remove/material/" in command:
        print("Deleting a material...")
        return delete_material()
    elif "/update/material/" in command and "/piece" in command:
        print("Updating a piece price...")
        return update_material_piece()
    elif "/add/material/" in command and "/piece" in command:
        print("Adding a piece price...")
        return add_material_piece()
    elif "/material/" in command and "/optimize-cuts/" in command:
        print("Optimizing cuts...")
        return optimize()
    else:
        return show_help()

def make_api_request(url, method="GET", data=None):
    headers = {"Content-Type": "application/json"}
    try:
        if method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError("Invalid HTTP method")
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

def show_help():
    help_text = """
    Available commands:
    - /register-material
    - /register-material-prices/
    - /materials
    - /materials/
    - /materials/piece-prices
    - /remove/material/
    - /update/material/piece
    - /add/material/piece
    - /material/optimize-cuts/

    id represents the id of the material.
    
    Example usage:
        /register-material
    
    
    
    Type 'exit' to quit the program.
    """
    return help_text


def run():
    while True:
        # Get user input for the command
        user_command = input("Enter a command (or 'exit' to quit): ")

        if user_command.lower() == 'exit':
            break

        
        # Run the command and get the output
        output = run_command(process_the_requests(user_command))

        # Process the output if the command was successful
        if output:
            run_command("dfx stop")
            print(output)

def deploy_canister():
    print("Deploying canister...")
    output = run_command("dfx deploy",background=True)
    print(output)
    return "Canister deployed."
    

def start_local_replica():
    print("Starting local Internet Computer replica...")
    process = run_command("dfx start --host 127.0.0.1:8000 --clean", background=True)
    time.sleep(10)  # Wait for the replica to start
    print("Local replica started.")
    return process

if __name__ == "__main__":
    run()
    


#

# def deploy_canister():
#     print("Deploying canister...")
#     output = run_command("dfx deploy")
#     print(output)
#     print("Canister deployed.")
