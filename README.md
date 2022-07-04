# Starknet Bitcoin Tx Relayer

### This repo is tested against the following version
starknet-devnet = 0.2.3 <br>
Protostar version: 0.2.3 <br>
Cairo-lang version: ^0.9.0<br>
Python: 3.9.12 (I'm using nix to manage my local python)

## Starting local instance
1. Ensure `.env` file is created at the root directory. Refer to `.env_sample` for a template on how the `.env` file should look like.
2. To start up a local devnet. In the root folder run
``` bash
make server
``` 
it should spin up a node instance with prefunded account. In our local environment, we are free to select any of the prefunded accounts as the `owner` and `relayer`. Make sure to update them in `.env`

3. Set `STARTING_BLOCK` and `ENDING_BLOCK` in `.env` so that we are able to control the blocks that we want to relay especially in our local environment. Also register for an account in [GetBlock.io](https://getblock.io) and get the Api key and update the `GETBLOCK_API_KEY` field. We will rely on GetBlock to feed us with the correct block info.

4. To start crawling and saving the block, run: 
```bash
make crawl
```
The block info will be stored in the directory specified in `JSON_DIRECTORY`  (keep the crawler running in its own seperate terminal)

5. Once we have the data, we will run:
```bash
make deploy
``` 
to deploy our contract. Take note of our contract address and update the `TX_RELAYER` field in `.env`. Once we see the contract address, we can safely `CTRL + C` to kill the process

6. Then we can start relaying blocks by running
``` bash
make relay
``` 
We will be able to see our blocks being relayed to our chain. To keep relaying, we will need to keep the terminal alive. 

7. (Note we need to update the `.env` in `frontend` folder to specify the contract address as well as the baseUrl, refer to `.env_sample`). In a new terminal, we will run <br> 
```
make web
``` 
 to start up our frontend server

## Verifying our transaction

Our python script that we will need to use to generate merkle path relies on a few dependencies. I would generally recommend to use a virtual environment to not mess up with our global python env.

To setup `.venv` in the root folder: 
```
python3 -m venv .venv
source .venv/bin/activate
```

On M1:
```
pip install -r requirements.txt
```

On Linux:
```
pip install pysha3
```

these should download all dependencies in the `requirements.txt` file.


1. In our webpage, we will be able to see the latest block that has been relayed to the chain.
2. To test that our verification is done correctly, we will need to input the `index` of our transaction as well as `path` of our merkle proof. To facilitate the generation of proof conveniently, we will be using some cli tools included in this repo as well.
3. change directory
```
cd bitcoin-tx
```
4. To create a proof, run : <br>
```
python3 create_merkle_root_with_path.py -i <index> -f <file_containing_all_txs_in_block> -o <path.json>
``` 
(refer to `txs.json` for how the txs look like)
5. The path will be generated in the output file which we have specified previously.
6. Input the block number which we get our txs from, the index which we used to generate our path, and copy and paste the content from the output file into our webpage.
7. If everything goes well, it will say that the verification is successful.

<img width="816" alt="image" src="https://user-images.githubusercontent.com/60590919/175042184-7a8a5606-2b96-4eed-a80d-901322e26c91.png">
