# Sugyr

> A stupid simple Dependency Injection framework for TypeScript in a 2KB package

## Usage

### Install

`npm install sugyr`

`yarn add sugyr`

### Setup

```typescript
import { ServiceContainer, Service } from 'sugyr';

// create your services with the @Service() decorator. This is required
// in order for Sugyr to determine what the constructor looks like
@Service()
class LoggingService {
  log(message: string, ...args: any[]) {
    console.log(message, ...args);
  }
}

@Service()
class ScopedService {
  constructor(private logger: LoggingService) {}

  greet(name: string) {
    this.logger.log('Hello, {0}!', name);
  }
}

const serviceContainer = new ServiceContainer()
  // we can add scoped services to the container. This declares that any
  // services of this type will be recreated for each injection.
  .addScoped(ScopedService)
  // or we can add a singleton service that will be created on first injection
  // and reused acrossed all other injections.
  .addSingleton(LoggerService);

// to get a registered service, we simply call ServiceContainer.getService
const scopedServiceInstance = serviceContainer.getService(ScopedService);
```

## About

I love Microsoft's Dependency Injection framework and I find myself missing it in every language I write. This was my way of bringing something similar yet also as compact as possible to TypeScript.

# License

Do whatever you want with it.
