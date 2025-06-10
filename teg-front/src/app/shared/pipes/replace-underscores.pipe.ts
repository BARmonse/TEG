import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replaceUnderscores' })
export class ReplaceUnderscoresPipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.replace(/_/g, ' ') : '';
  }
} 