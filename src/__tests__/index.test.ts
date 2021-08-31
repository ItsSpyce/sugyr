import { Service, ServiceContainer } from '..';

const disposeFn = jest.fn();

@Service()
class SingletonService {
  static count = 0;
  id: number;
  constructor() {
    this.id = SingletonService.count++;
  }

  sayHello() {
    return 'hello';
  }

  dispose() {
    disposeFn();
  }
}

@Service()
class ScopedServiceWithOneSingleton {
  constructor(public testService: SingletonService) {}
}

@Service()
class ScopedServiceWithTwoSingleton {
  constructor(
    public singletonServiceA: SingletonService,
    public singletonServiceB: SingletonService
  ) {}
}

describe('services-container', () => {
  it('can register a service and return it', () => {
    const container = new ServiceContainer();
    container
      .addSingleton(SingletonService)
      .addScoped(ScopedServiceWithOneSingleton);
    const instance = container.getService(ScopedServiceWithOneSingleton);
    expect(instance).toBeTruthy();
    expect(instance.testService).toBeTruthy();
    expect(instance.testService.sayHello()).toBe('hello');
  });

  it('only registers one instance of a singleton service', () => {
    const container = new ServiceContainer();
    container
      .addSingleton(SingletonService)
      .addScoped(ScopedServiceWithTwoSingleton);

    const instance = container.getService(ScopedServiceWithTwoSingleton);
    expect(instance.singletonServiceA.id === instance.singletonServiceB.id);
  });

  it('calls dispose when a singleton is disposed of', () => {
    const container = new ServiceContainer();
    container
      .addSingleton(SingletonService)
      .addScoped(ScopedServiceWithOneSingleton);

    container.collectSingleton(SingletonService);
    // create the required services
    container.getService(ScopedServiceWithOneSingleton);
    container.collectSingleton(SingletonService);
    expect(disposeFn).toBeCalledTimes(1);
  });
});
