server:
	@starknet-devnet --port 5050 --seed 1
	export STARKNET_GATEWAY_URL=http://localhost:5050/
	export STARKNET_FEEDER_GATEWAY_URL=http://localhost:5050/

crawl:
	@python3 ./block-crawler/main.py

deploy:
		@cd ./relayer-hardhat && \
		npm run deploy 

relay:
		@cd ./relayer-hardhat && \
		npm run relay 

web: 
	@cd ./frontend && \
	npm start