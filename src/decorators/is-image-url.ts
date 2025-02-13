import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsPngOrJpg(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isImageUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          return /\.(jpg|jpeg|png)$/i.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid image URL ending with .jpg, .jpeg, or .png`;
        },
      },
    });
  };
}
