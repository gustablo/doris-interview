export abstract class BaseEntity<T> {
  readonly id?: number;
  public props: T;

  constructor(props: T, id?: number) {
    if (id) {
      this.id = id;
    }
    this.props = props;
  }
}
