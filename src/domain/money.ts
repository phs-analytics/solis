const FMT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Valor imutável em centavos inteiros (BRL). */
export class Money {
  readonly centavos: number;

  private constructor(centavos: number) {
    this.centavos = centavos;
  }

  static fromCentavos(c: number): Money {
    if (!Number.isSafeInteger(c)) throw new RangeError('centavos deve ser inteiro');
    return new Money(c);
  }

  static fromReais(r: number): Money {
    return Money.fromCentavos(Math.round(r * 100));
  }

  add(o: Money): Money {
    return Money.fromCentavos(this.centavos + o.centavos);
  }
  sub(o: Money): Money {
    return Money.fromCentavos(this.centavos - o.centavos);
  }
  isNegative(): boolean {
    return this.centavos < 0;
  }
  toString(): string {
    return FMT.format(this.centavos / 100);
  }
  toJSON(): number {
    return this.centavos;
  }
}
