server:
	@starknet-devnet --port 5001
	export STARKNET_GATEWAY_URL=http://localhost:5001/
	export STARKNET_FEEDER_GATEWAY_URL=http://localhost:5001/

crawl:
	@python3 ./block-crawler/main.py