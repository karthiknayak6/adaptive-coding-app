import argparse

# Define a function to be called with command-line arguments
def my_function(arg1, arg2):
    print(f"Argument 1: {arg1}")
    print(f"Argument 2: {arg2}")

# Set up argument parsing
parser = argparse.ArgumentParser(description="Process some integers.")
parser.add_argument('arg1', type=int, help='The first argument')
parser.add_argument('arg2', type=int, help='The second argument')

# Parse the arguments
args = parser.parse_args()

# Call the function with the parsed arguments
my_function(args.arg1, args.arg2)
