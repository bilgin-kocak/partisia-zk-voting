/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import BN from "bn.js";
import {
  AbiParser,
  AbstractBuilder,
  BigEndianReader,
  FileAbi,
  FnKinds,
  FnRpcBuilder,
  RpcReader,
  ScValue,
  ScValueEnum,
  ScValueOption,
  ScValueStruct,
  StateReader,
  TypeIndex,
  StateBytes,
  BlockchainAddress,
} from "@partisiablockchain/abi-client";
import { BigEndianByteOutput } from "@secata-public/bitmanipulation-ts";

const fileAbi: FileAbi = new AbiParser(Buffer.from(
  "5042434142490b000005040000000005010000000a566f7465526573756c740000000300000009766f7465735f666f72030000000d766f7465735f616761696e737403000000067061737365640c010000000d436f6e7472616374537461746500000003000000056f776e65720d00000014646561646c696e655f766f74696e675f74696d65090000000b766f74655f726573756c74120000010000000b536563726574566172496400000001000000067261775f69640301000000134576656e74537562736372697074696f6e496400000001000000067261775f696408010000000f45787465726e616c4576656e74496400000001000000067261775f69640800000005010000000a696e697469616c697a65ffffffff0f0000000100000012766f74696e675f6475726174696f6e5f6d730317000000086164645f766f746540000000000000000c7365637265745f696e70757408020000001373746172745f766f74655f636f756e74696e6701000000001300000011636f756e74696e675f636f6d706c657465edf4f6770000000014000000116f70656e5f73756d5f7661726961626c65c6f5858c0c000000000001",
  "hex"
)).parseAbi();

type Option<K> = K | undefined;

export interface VoteResult {
  votesFor: number;
  votesAgainst: number;
  passed: boolean;
}

export function newVoteResult(votesFor: number, votesAgainst: number, passed: boolean): VoteResult {
  return {votesFor, votesAgainst, passed};
}

function fromScValueVoteResult(structValue: ScValueStruct): VoteResult {
  return {
    votesFor: structValue.getFieldValue("votes_for")!.asNumber(),
    votesAgainst: structValue.getFieldValue("votes_against")!.asNumber(),
    passed: structValue.getFieldValue("passed")!.boolValue(),
  };
}

export interface ContractState {
  owner: BlockchainAddress;
  deadlineVotingTime: BN;
  voteResult: Option<VoteResult>;
}

export function newContractState(owner: BlockchainAddress, deadlineVotingTime: BN, voteResult: Option<VoteResult>): ContractState {
  return {owner, deadlineVotingTime, voteResult};
}

function fromScValueContractState(structValue: ScValueStruct): ContractState {
  return {
    owner: BlockchainAddress.fromBuffer(structValue.getFieldValue("owner")!.addressValue().value),
    deadlineVotingTime: structValue.getFieldValue("deadline_voting_time")!.asBN(),
    voteResult: structValue.getFieldValue("vote_result")!.optionValue().valueOrUndefined((sc1) => fromScValueVoteResult(sc1.structValue())),
  };
}

export function deserializeContractState(state: StateBytes): ContractState {
  const scValue = new StateReader(state.state, fileAbi.contract, state.avlTrees).readState();
  return fromScValueContractState(scValue);
}

export interface SecretVarId {
  rawId: number;
}

export function newSecretVarId(rawId: number): SecretVarId {
  return {rawId};
}

function fromScValueSecretVarId(structValue: ScValueStruct): SecretVarId {
  return {
    rawId: structValue.getFieldValue("raw_id")!.asNumber(),
  };
}

export interface EventSubscriptionId {
  rawId: number;
}

export function newEventSubscriptionId(rawId: number): EventSubscriptionId {
  return {rawId};
}

function fromScValueEventSubscriptionId(structValue: ScValueStruct): EventSubscriptionId {
  return {
    rawId: structValue.getFieldValue("raw_id")!.asNumber(),
  };
}

export interface ExternalEventId {
  rawId: number;
}

export function newExternalEventId(rawId: number): ExternalEventId {
  return {rawId};
}

function fromScValueExternalEventId(structValue: ScValueStruct): ExternalEventId {
  return {
    rawId: structValue.getFieldValue("raw_id")!.asNumber(),
  };
}

export function initialize(votingDurationMs: number): Buffer {
  const fnBuilder = new FnRpcBuilder("initialize", fileAbi.contract);
  fnBuilder.addU32(votingDurationMs);
  return fnBuilder.getBytes();
}

export function computeAverageSalary(): Buffer {
  const fnBuilder = new FnRpcBuilder("start_vote_counting", fileAbi.contract);
  return fnBuilder.getBytes();
}

