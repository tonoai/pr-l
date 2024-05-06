export const SkipTransformSymbol = Symbol('SkipTransformSymbol');

export function SkipTransformInterceptor() {
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value[SkipTransformSymbol] = true;
  };
}
