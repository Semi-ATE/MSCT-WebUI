/* eslint-disable @typescript-eslint/no-explicit-any */
export function wait(ms = 1000): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export async function expectWaitUntil(
  fn: () => void,
  fnCondition: () => boolean,
  errorMessage: string,
  pollInterval = 50,
  timeout = 1500): Promise<void> {
  const startTime = performance.now();
  let timeoutReached = false;
  while (!fnCondition()) {
    await wait(pollInterval);
    if (fn)
      fn();
    if (performance.now() - startTime > timeout) {
      timeoutReached = true;
      break;
    }
  }
  expect(!timeoutReached).toBe(true,errorMessage);
}

export async function expectWhile(
  loopFunction: () => void,
  conditionFunction: () => boolean,
  onFailedMessage: string,
  checkConditionInterval = 100,
  timeout = 1500): Promise<void> {
    // check input parameters
    expect(timeout).toBeLessThan(jasmine.DEFAULT_TIMEOUT_INTERVAL, 'jasmine default timeout must be greater than the provided timeout');
    expect(checkConditionInterval).toBeGreaterThan(0);
    const loopNumber = timeout / checkConditionInterval;
    expect(loopNumber).toBeGreaterThan(0);

    let failed = false;
    for(let i = 0; i < timeout / checkConditionInterval; ++i) {
      if (loopFunction)
        loopFunction();
      if(!conditionFunction()) {
        failed = true;
        break;
      }
      await wait(checkConditionInterval);
    }
    expect(failed).toBe(false, onFailedMessage);
  }

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function spyOnStoreArguments(object: any, method: string, args: Array<any>): jasmine.Spy<any> {
  // As we need a function here we have to disable the only-arrow-functions rule here
  // the reason is that the this context, i.e. execution context is different from function
  // and arrow functions
  return spyOn<any>(object, method).and.callFake(function() {
    let idx = 0;
    args.splice(0, args.length);
    // eslint-disable-next-line prefer-rest-params
    while(arguments[idx]) {
      // eslint-disable-next-line prefer-rest-params
      args.push(arguments[idx]);
      idx++;
    }
  });
}
