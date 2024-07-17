# import argparse

# # Define a function to be called with command-line arguments
# def my_function(arg1_arr_str, arg2_str):
#     try:
#         arg_array = [int(x) for x in arg1_arr_str.split(',')]
#         # Convert string arguments to integers
#         # arg1 = int(arg1_str)
#         arg2 = int(arg2_str)
#     except ValueError:
#         print("Error: Arguments must be convertible to integers.")
#         return
    
#     print(f"Argument 1: {arg_array}")
#     print(f"Argument 2: {arg2}")

# # Set up argument parsing
# parser = argparse.ArgumentParser(description="Process some integers.")
# parser.add_argument('arg1', type=str, help='The first argument (string representation of an integer)')
# parser.add_argument('arg2', type=str, help='The second argument (string representation of an integer)')

# # Parse the arguments
# args = parser.parse_args()

# # Call the function with the parsed arguments
# my_function(args.arg1, args.arg2)




import argparse

# Define a function to be called with command-line arguments
def my_function(arg1_arr_str, arg2_str):
    try:
        # Convert the first argument (a string of comma-separated numbers) to a list of integers
        arg_array = [int(x) for x in arg1_arr_str.split(',')]
        # Convert the second argument (a single number as a string) to an integer
        arg2 = int(arg2_str)
    except ValueError:
        print("Error: Arguments must be convertible to integers.")
        return
    
    print(f"Argument 1: {arg_array}")
    print(f"Argument 2: {arg2}")

# Set up argument parsing
parser = argparse.ArgumentParser(description="Process some integers.")
parser.add_argument('arg1', type=str, help='The first argument (comma-separated integers)')
parser.add_argument('arg2', type=str, help='The second argument (an integer)')

# Parse the arguments
args = parser.parse_args()

# Call the function with the parsed arguments
my_function(args.arg1, args.arg2)





import argparse

# Define a function to be called with command-line arguments
def my_function(arg_array, arg2):
    try:
        # arg_array is already a list of integers
        arg2 = int(arg2)
    except ValueError:
        print("Error: Arguments must be convertible to integers.")
        return
    
    print(f"Argument 1: {arg_array}")
    print(f"Argument 2: {arg2}")

# Set up argument parsing
parser = argparse.ArgumentParser(description="Process some integers.")
parser.add_argument('arg1', type=int, nargs='+', help='The first argument (list of integers)')
parser.add_argument('arg2', type=int, help='The second argument (an integer)')

# Parse the arguments
args = parser.parse_args()

# Call the function with the parsed arguments
my_function(args.arg1, args.arg2)







import argparse
import ast

def twoSum(nums, target):
    # Write your code here

# Dont Touch the below code!!
parser = argparse.ArgumentParser(description="Process any data types.")
parser.add_argument('arg1', nargs='+', help='The first argument (can be any type)')
parser.add_argument('arg2', help='The second argument (can be any type)')
args = parser.parse_args()
list_from_string = ast.literal_eval(args.arg1[0].replace(' ', ','))
result = twoSum(list_from_string, int(args.arg2))
print(result)
    




import argparse
import ast

def addTwoNumbers(a, b):
    # Write your code here
    

# Dont Touch the below code!!
parser = argparse.ArgumentParser(description="Process any data types.")
parser.add_argument('arg1', nargs='+', help='The first argument (can be any type)')
parser.add_argument('arg2', help='The second argument (can be any type)')
args = parser.parse_args()
list_from_string = ast.literal_eval(args.arg1[0].replace(' ', ','))
result = addTwoNumbers(list_from_string, int(args.arg2))
print(result)


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
