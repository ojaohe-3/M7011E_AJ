import requests
import numpy as np
import json
import sys

def main(args):
    url = args[0]
    data = {"input_ratio": args[1], "output_ratio": args[2], "status": args[3]}
    x = requests.post(url, data=json.dumps(data), headers={'Content-type': 'application/json'})
    



if __name__ == "__main__":
    main(sys.argv)
