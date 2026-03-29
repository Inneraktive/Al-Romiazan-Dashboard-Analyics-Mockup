let _seed = 42

export function srand(): number {
  _seed = ((_seed * 16807) % 2147483647)
  return (_seed - 1) / 2147483646
}

export function resetSeed(seed: number = 42): void {
  _seed = seed
}
