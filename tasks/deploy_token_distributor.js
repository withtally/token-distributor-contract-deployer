const { tokenDistributor } = require('../helpers/token_distributor_deploy');

// const { getExpectedContractAddress } = require('../../helpers/expected_contract');
const fs = require('fs');

task('tokenDistributor', "Deploys a token distributor.")
    .addParam("root", "The root of the Merkle tree. It's a bytes 32 hash: 0xd5b13e5d2412661bc4ffbfaea0e5e3dfc8d8ee2587404490e94d5280e1a739d3")
    .addParam("token", "The token address, e.g: 0x5FbDB2315678afecb367f032d93F642f64180aa3")
    .addParam("total", "total amount claimable, e.g: 100000000000000000000 ( a number )")
    .addParam("start", "claim period start, e.g: 1625097600 ( an integer )")
    .addParam("end", "claim period end, e.g: 1625097600 ( an integer )")
    .addOptionalParam("delegate", "ethereum address who will be delegated to. e.g: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    .setAction(async (taskArgs, hre) => {
        console.log("Deploying a Token Distributor contract");

        const signer = await hre.ethers.getSigner();

        // HARDHAT LOG
        console.log(
            `network:\x1B[36m${hre.network.name}\x1B[37m`,
            `\nsigner:\x1B[33m${signer.address}\x1B[37m\n`
        );

        // token data
        const _root = taskArgs.root;
        const _token = taskArgs.token;
        const _totalClaimable = taskArgs.total;
        const _claimPeriodStart = taskArgs.start;
        const _claimPeriodEnd = taskArgs.end;
        const _delegateTo = taskArgs.delegate;

        // INFO LOGS
        console.log("root:\x1B[36m", _root, "\x1B[37m");
        console.log("token:\x1B[36m", _token, "\x1B[37m");
        console.log("total:\x1B[36m", _totalClaimable, "\x1B[37m");
        console.log("start:\x1B[36m", _claimPeriodStart, "\x1B[37m");
        console.log("end:\x1B[36m", _claimPeriodEnd, "\x1B[37m");
        console.log("delegate:\x1B[36m", _delegateTo, "\x1B[37m");

        // constructor( bytes32 _root, ERC20Votes _token, uint256 _totalClaimable, uint256 _claimPeriodStart, uint256 _claimPeriodEnd, address _delegateTo ) 
        const TokenDistributor = await tokenDistributor(
            _root,
            _token,
            _totalClaimable,
            _claimPeriodStart,
            _claimPeriodEnd,
            _delegateTo,
            signer
        )

        const tdBlock = await hre.ethers.provider.getBlock("latest")

        // DEPLOYMENT LOGS
        console.log(`Token Distributor deployed to:\x1B[33m`, TokenDistributor.address, "\x1B[37m");
        console.log(`Creation block number:`, tdBlock.number);

        // verify cli
        const verify_str = `npx hardhat verify ` +
            `--network ${network.name} ` +
            `${TokenDistributor.address} ` +
            `"${_root}" "${_token}" ${_totalClaimable} ${_claimPeriodStart} ${_claimPeriodEnd} ${_delegateTo}`

        console.log("\n" + verify_str)

        // save it to a file to make sure the user doesn't lose it.
        fs.appendFileSync('contracts.out', `${new Date()}\nToken contract deployed at: ${TokenDistributor.address}` +
        ` - ${hre.network.name} - block number: ${tdBlock.number}\n${verify_str}\n\n`);

        fs.appendFileSync('contracts.out', `\n \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ \n\n`);
    });