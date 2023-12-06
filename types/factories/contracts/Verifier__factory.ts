/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  BytesLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../common";
import type { Verifier, VerifierInterface } from "../../contracts/Verifier";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_root",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "generateLeaf",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "proof",
        type: "bytes32[]",
      },
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "verify",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516103db3803806103db83398101604081905261002f91610037565b600055610050565b60006020828403121561004957600080fd5b5051919050565b61037c8061005f6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806304b38ce01461003b578063ada1f9e514610050575b600080fd5b61004e61004936600461022f565b6100b7565b005b6100a561005e366004610308565b6040516bffffffffffffffffffffffff19606084901b1660208201526034810182905260009060540160405160208183030381529060405280519060200120905092915050565b60405190815260200160405180910390f35b6040516bffffffffffffffffffffffff19606084901b16602082015260348101829052600090605401604051602081830303815290604052805190602001209050610105846000548361015b565b6101555760405162461bcd60e51b815260206004820152600d60248201527f496e76616c69642070726f6f6600000000000000000000000000000000000000604482015260640160405180910390fd5b50505050565b6000826101688584610171565b14949350505050565b600081815b84518110156101b6576101a28286838151811061019557610195610332565b60200260200101516101be565b9150806101ae81610348565b915050610176565b509392505050565b60008183106101da5760008281526020849052604090206101e9565b60008381526020839052604090205b9392505050565b634e487b7160e01b600052604160045260246000fd5b803573ffffffffffffffffffffffffffffffffffffffff8116811461022a57600080fd5b919050565b60008060006060848603121561024457600080fd5b833567ffffffffffffffff8082111561025c57600080fd5b818601915086601f83011261027057600080fd5b8135602082821115610284576102846101f0565b8160051b604051601f19603f830116810181811086821117156102a9576102a96101f0565b60405292835281830193508481018201928a8411156102c757600080fd5b948201945b838610156102e5578535855294820194938201936102cc565b97506102f49050888201610206565b955050505050604084013590509250925092565b6000806040838503121561031b57600080fd5b61032483610206565b946020939093013593505050565b634e487b7160e01b600052603260045260246000fd5b60006001820161036857634e487b7160e01b600052601160045260246000fd5b506001019056fea164736f6c6343000814000a";

type VerifierConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VerifierConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Verifier__factory extends ContractFactory {
  constructor(...args: VerifierConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _root: BytesLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(_root, overrides || {});
  }
  override deploy(
    _root: BytesLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(_root, overrides || {}) as Promise<
      Verifier & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): Verifier__factory {
    return super.connect(runner) as Verifier__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VerifierInterface {
    return new Interface(_abi) as VerifierInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): Verifier {
    return new Contract(address, _abi, runner) as unknown as Verifier;
  }
}