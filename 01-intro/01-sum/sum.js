function sum(a, b) {
  /* ваш код */
  const mustType = 'number';
  if (typeof a === mustType && typeof b === mustType) {
    return a + b;
  }

  throw new TypeError('Неверный тип аргумента');
}

module.exports = sum;
