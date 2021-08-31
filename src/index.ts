import 'reflect-metadata';

interface Constructor<T> {
  new (...args: any[]): T;
}

interface ClassDecorator<T> {
  (target: T): void;
}

export interface IDisposable {
  dispose(): void;
}

export interface IServiceContainer {
  /**
   * Registers a scoped service. A scoped service will only be created on the building
   * of the injected property.
   */
  addScoped<T>(ctor: Constructor<T>): IServiceContainer;
  /**
   * Registers a singleton service. One type will be used across all injections
   */
  addSingleton<T>(ctor: Constructor<T>): IServiceContainer;

  getService<T>(ctor: Constructor<T>): T;
  collectSingleton<T>(ctor: Constructor<T>): void;
}

export function Service<T>(): ClassDecorator<Constructor<T>> {
  return () => {
    // exists just so we can collect paramtypes
  };
}

enum ServiceLifetime {
  SCOPED,
  SINGLETON,
}

const forbiddenConstructors = [
  String.name,
  Number.name,
  BigInt.name,
  Boolean.name,
  Symbol.name,
];

class ServiceResolver implements IDisposable {
  private lastValue: any;

  constructor(
    private container: IServiceContainer,
    private serviceCtr: Constructor<any>,
    private lifetime: ServiceLifetime
  ) {}

  checkSafetyOfToken<T>(token: Constructor<T>): Constructor<T> {
    // this will catch native types while the container will catch anything else
    if (forbiddenConstructors.indexOf(token.name) > -1) {
      throw new Error('Cannot use a native type as an injected value');
    }
    return token;
  }

  resolve<T>(): T {
    if (
      this.lifetime === ServiceLifetime.SINGLETON &&
      typeof this.lastValue !== 'undefined'
    ) {
      return this.lastValue;
    }
    const tokens =
      Reflect.getMetadata('design:paramtypes', this.serviceCtr) || [];
    const injections = tokens.map((token: any) =>
      this.container.getService(this.checkSafetyOfToken(token))
    );
    const resolved = new this.serviceCtr(...injections) as T;
    this.lastValue = resolved;
    return resolved;
  }

  dispose() {
    if (typeof this.lastValue === 'undefined') {
      return;
    }
    if ('dispose' in this.lastValue) {
      // if it implements IDisposable or has it without implementing the class, call it
      this.lastValue.dispose();
    }
  }
}

export class ServiceContainer implements IServiceContainer {
  private registeredServices = new Map<string, ServiceResolver>();

  private addService<T>(ctor: Constructor<T>, lifetime: ServiceLifetime) {
    const name = ctor.name;
    if (!this.registeredServices.has(name)) {
      this.registeredServices.set(
        name,
        new ServiceResolver(this, ctor, lifetime)
      );
    }
    return this;
  }

  addScoped<T>(ctor: Constructor<T>): IServiceContainer {
    return this.addService(ctor, ServiceLifetime.SCOPED);
  }
  addSingleton<T>(ctor: Constructor<T>): IServiceContainer {
    return this.addService(ctor, ServiceLifetime.SINGLETON);
  }
  getService<T>(ctor: Constructor<T>): T {
    console.log(`getting dependency ${ctor.name}`);
    if (this.registeredServices.has(ctor.name)) {
      const resolver = this.registeredServices.get(ctor.name);
      return resolver!.resolve<T>();
    }
    throw new Error(
      `Could not find a registered service with the type ${ctor.name}`
    );
  }
  collectSingleton<T>(ctor: Constructor<T>): void {
    if (this.registeredServices.has(ctor.name)) {
      const resolver = this.registeredServices.get(ctor.name)!;
      resolver.dispose();
    }
  }
}
