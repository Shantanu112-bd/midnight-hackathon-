import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  employeeSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  managerSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  employeeCredential(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  createPromise(context: __compactRuntime.CircuitContext<PS>,
                promiseHash_0: Uint8Array,
                timestamp_0: Uint8Array,
                promiseIdx_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  markFulfilled(context: __compactRuntime.CircuitContext<PS>,
                promiseId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  markBroken(context: __compactRuntime.CircuitContext<PS>, promiseId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fileComplaint(context: __compactRuntime.CircuitContext<PS>,
                complaintHash_0: Uint8Array,
                targetManagerHash_0: Uint8Array,
                complaintIdx_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  checkThreshold(context: __compactRuntime.CircuitContext<PS>,
                 managerSlot_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  getReliabilityScore(context: __compactRuntime.CircuitContext<PS>,
                      managerIdx_0: bigint): __compactRuntime.CircuitResults<PS, [bigint,
                                                                                  bigint]>;
}

export type ProvableCircuits<PS> = {
  createPromise(context: __compactRuntime.CircuitContext<PS>,
                promiseHash_0: Uint8Array,
                timestamp_0: Uint8Array,
                promiseIdx_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  markFulfilled(context: __compactRuntime.CircuitContext<PS>,
                promiseId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  markBroken(context: __compactRuntime.CircuitContext<PS>, promiseId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fileComplaint(context: __compactRuntime.CircuitContext<PS>,
                complaintHash_0: Uint8Array,
                targetManagerHash_0: Uint8Array,
                complaintIdx_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  checkThreshold(context: __compactRuntime.CircuitContext<PS>,
                 managerSlot_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  getReliabilityScore(context: __compactRuntime.CircuitContext<PS>,
                      managerIdx_0: bigint): __compactRuntime.CircuitResults<PS, [bigint,
                                                                                  bigint]>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  createPromise(context: __compactRuntime.CircuitContext<PS>,
                promiseHash_0: Uint8Array,
                timestamp_0: Uint8Array,
                promiseIdx_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  markFulfilled(context: __compactRuntime.CircuitContext<PS>,
                promiseId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  markBroken(context: __compactRuntime.CircuitContext<PS>, promiseId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fileComplaint(context: __compactRuntime.CircuitContext<PS>,
                complaintHash_0: Uint8Array,
                targetManagerHash_0: Uint8Array,
                complaintIdx_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  checkThreshold(context: __compactRuntime.CircuitContext<PS>,
                 managerSlot_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  getReliabilityScore(context: __compactRuntime.CircuitContext<PS>,
                      managerIdx_0: bigint): __compactRuntime.CircuitResults<PS, [bigint,
                                                                                  bigint]>;
}

export type Ledger = {
  readonly round: bigint;
  promises: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): { promiseHash: Uint8Array,
                             employeeAddr: Uint8Array,
                             managerAddr: Uint8Array,
                             timestamp: Uint8Array,
                             status: bigint
                           };
    [Symbol.iterator](): Iterator<[bigint, { promiseHash: Uint8Array,
  employeeAddr: Uint8Array,
  managerAddr: Uint8Array,
  timestamp: Uint8Array,
  status: bigint
}]>
  };
  readonly promiseCount: bigint;
  complaints: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): { complaintHash: Uint8Array,
                             targetManagerHash: Uint8Array,
                             verified: boolean
                           };
    [Symbol.iterator](): Iterator<[bigint, { complaintHash: Uint8Array, targetManagerHash: Uint8Array, verified: boolean }]>
  };
  readonly complaintCount: bigint;
  complaintCounts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): bigint;
    [Symbol.iterator](): Iterator<[bigint, bigint]>
  };
  reputations: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): { promisesCreated: bigint,
                             promisesFulfilled: bigint,
                             promisesBroken: bigint
                           };
    [Symbol.iterator](): Iterator<[bigint, { promisesCreated: bigint, promisesFulfilled: bigint, promisesBroken: bigint }]>
  };
  readonly reputationCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
