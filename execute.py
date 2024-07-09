import subprocess

def run_command(command):
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True, shell=True)
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

def process_the_requests(command):
    if "/register-material" in command:
        print("Registering material...")
    elif "/register-material-prices/" in command:
        print("Registering material prices...")
    elif "/materials" in command and "/materials/" not in command:
        print("Retrieving all materials...")
    elif "/materials/" in command and "/piece-prices" not in command:
        print("Retrieving a material...")
    elif "/materials/" in command and "/piece-prices" in command:
        print("Retrieving piece prices...")
    elif "/remove/material/" in command:
        print("Deleting a material...")
    elif "/update/material/" in command and "/piece" in command:
        print("Updating a piece price...")
    elif "/add/material/" in command and "/piece" in command:
        print("Adding a piece price...")
    elif "/material/" in command and "/optimize-cuts/" in command:
        print("Optimizing cuts...")
    else:
        print("Unknown command.")

def show_help():
    help_text = """
    Available commands:
    - /register-material
    - /register-material-prices/:id
    - /materials
    - /materials/:id
    - /materials/:id/piece-prices
    - /remove/material/:id
    - /update/material/:id/piece
    - /add/material/:id/piece
    - /material/:id/optimize-cuts/:length

    id represents the id of the material.
    
    Example usage:
        /register-material
    
    
    
    Type 'exit' to quit the program.
    """
    print(help_text)


def run():
    while True:
        # Get user input for the command
        user_command = input("Enter a command (or 'exit' to quit): ")

        if user_command.lower() == 'exit':
            break

        # Run the command and get the output
        output = run_command(user_command)

        # Process the output if the command was successful
        if output:
            process_output(output)


if __name__ == "__main__":
    run()
    
