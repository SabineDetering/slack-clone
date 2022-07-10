import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'countElementsExcluding' })
export class ExcludePipe implements PipeTransform {

  transform(array: string[], value: string): number {
      return array.length - array.filter((item) => item == value).length;
  }
}
