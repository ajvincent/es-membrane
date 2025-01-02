import { Worker } from "worker_threads";
import os from "os";
import { randomUUID } from "crypto";
import EventEmitter from "events";

import type {
  SourceFileStructure
} from "ts-morph";

import type {
  SerializeRequest,
  SerializeResponse
} from "./_types/SerializeSourceMessages.ts";

import {
  Deferred
} from "./PromiseTypes.js";

void(os);

/**
 * @see {@link https://nodejs.org/dist/latest-v18.x/docs/api/async_context.html#using-asyncresource-for-a-worker-thread-pool}
 */
class WorkerPool extends EventEmitter
{
  static readonly #threadURL = new URL("./tasks/SerializeSource.js", import.meta.url);
  static readonly #workerFreedEvent = Symbol("worker freed");

  static singleton?: WorkerPool;

  readonly #workerSet = new Set<Worker>;
  readonly #freeWorkers: Worker[] = [];
  readonly #queuedRequests: SerializeRequest[] = [];
  readonly #tokenToDeferredMap = new Map<SerializeRequest["token"], Deferred<string>>;
  readonly #workerToTokenMap = new WeakMap<Worker, SerializeRequest["token"]>;

  #isAlive = true;

  constructor()
  {
    super();

    const cpuCount = 1;//Math.ceil(os.availableParallelism() / 2);
    console.log("cpuCount: " + cpuCount);
    for (let i = 0; i < cpuCount; i++) {
      this.#createWorker();
    }

    this.on(WorkerPool.#workerFreedEvent, () => this.#dispatchNextRequest());
  }

  #createWorker(): void
  {
    const worker = new Worker(WorkerPool.#threadURL);
    worker.on(
      "message",
      (response: SerializeResponse) => this.#processResponse(worker, response)
    );
    worker.on("error", err => this.#processError(worker, err));
    this.#workerSet.add(worker);

    this.#freeWorkers.push(worker);
    this.emit(WorkerPool.#workerFreedEvent);
  }

  async serialize(
    absolutePathToFile: string,
    structure: SourceFileStructure,
  ): Promise<string>
  {
    if (!this.#isAlive) {
      throw new Error("this pool is already dead");
    }

    const request: SerializeRequest = {
      command: "serializeSource",
      token: randomUUID(),
      isRequest: true,
      absolutePathToFile,
      structure: JSON.parse(JSON.stringify(structure)) as SourceFileStructure,
    };
    const deferred = new Deferred<string>;

    this.#tokenToDeferredMap.set(request.token, deferred);
    this.#queuedRequests.push(request);

    this.#dispatchNextRequest();
    return deferred.promise;
  }

  #dispatchNextRequest(): void
  {
    if (!this.#queuedRequests.length || !this.#freeWorkers.length)
      return;

    const request = this.#queuedRequests.shift()!;
    const worker = this.#freeWorkers.shift()!;
    this.#workerToTokenMap.set(worker, request.token);
    worker.postMessage(request);
  }

  #processResponse(
    worker: Worker,
    response: SerializeResponse
  ): void
  {
    const deferred = this.#tokenToDeferredMap.get(response.token)!;
    this.#tokenToDeferredMap.delete(response.token);
    this.#workerToTokenMap.delete(worker);

    if (response.success) {
      deferred.resolve(response.source);
    }
    else {
      deferred.reject(response.error);
    }

    this.#freeWorkers.push(worker);
    this.emit(WorkerPool.#workerFreedEvent);
  }

  #processError(
    worker: Worker,
    err: Error
  ): void
  {
    const token = this.#workerToTokenMap.get(worker)!;
    const deferred = this.#tokenToDeferredMap.get(token)!;
    deferred.reject(err);

    this.#workerSet.delete(worker);
    this.#tokenToDeferredMap.delete(token);
    this.#createWorker();
  }

  async terminate(): Promise<number[]>
  {
    this.#isAlive = false;

    const promises: Promise<number>[] = [];
    for (const worker of this.#workerSet) {
      promises.push(worker.terminate());
    }

    this.#workerSet.clear();
    return Promise.all(promises);
  }
}

export default async function SerializeSource(
  absolutePathToFile: string,
  structure: SourceFileStructure,
): Promise<string>
{
  if (!WorkerPool.singleton)
    WorkerPool.singleton = new WorkerPool;

  return WorkerPool.singleton.serialize(absolutePathToFile, structure);
}
