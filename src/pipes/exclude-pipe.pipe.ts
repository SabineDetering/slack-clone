import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'exclude' })
export class ExcludePipe implements PipeTransform {
  /**
   * sorts a JSON array
   * @param array - JSON array to be sorted
   * @param prop - property used for sorting
   * @param direction - descending sorting order if 'desc', ascending otherwise
   * @returns - sorted JSON array
   */
  transform(array: string[], value: string): number {
    if (array.find(item => item == value)) {
      return array.length - array.filter((item) => item == value).length;
    } else {
      return array.length;
    }
  }
}
