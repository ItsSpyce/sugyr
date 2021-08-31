import { Service, ServiceContainer } from '..';

describe('services-container', () => {
  it('can register a service and return it', () => {
    const container = new ServiceContainer();
    @Service()
    class SingletonService {
      sayHello() {
        return 'hello';
      }
    }

    @Service()
    class ScopedService {
      constructor(public testService: SingletonService) {}
    }

    container.addSingleton(SingletonService).addScoped(ScopedService);
    const instance = container.getService(ScopedService);
    expect(instance).toBeTruthy();
    expect(instance.testService).toBeTruthy();
    expect(instance.testService.sayHello()).toBe('hello');
  });
});
