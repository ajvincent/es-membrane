import {
  SyncTaskQueue
} from "../../source/utilities/SyncTaskQueue.js";

it("SyncTasksQueue provides a simple iterator for tasks", () => {
  const callbacks: jasmine.Spy<() => void>[] = [];
  for (let index = 0; index <= 3; index++) {
    callbacks.push(jasmine.createSpy("task " + index));
  }

  const queue = new SyncTaskQueue;

  callbacks[0].and.callFake(() => queue.addTask(callbacks[2]));

  queue.addTask(callbacks[0]);
  queue.addTask(callbacks[1]);

  expect(callbacks[0]).not.toHaveBeenCalled();
  expect(callbacks[1]).not.toHaveBeenCalled();

  for (const task of queue.getTasks()) {
    task();
  }

  expect(callbacks[0]).toHaveBeenCalledBefore(callbacks[1]);
  expect(callbacks[1]).toHaveBeenCalledBefore(callbacks[2]);
  expect(callbacks[0]).toHaveBeenCalledTimes(1);
  expect(callbacks[1]).toHaveBeenCalledTimes(1);
  expect(callbacks[2]).toHaveBeenCalledTimes(1);

  for (const task of queue.getTasks()) {
    task();
  }

  expect(callbacks[0]).toHaveBeenCalledTimes(1);
  expect(callbacks[1]).toHaveBeenCalledTimes(1);
  expect(callbacks[2]).toHaveBeenCalledTimes(1);
});
