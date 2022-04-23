/**
 * Copyright (c) 2014-present Houfeng
 * @homepage https://github.com/Houfeng/ober
 * @author Houfeng <houzhanfeng@gmail.com>
 */

import { undef } from "./Util";

export function createSymbol(description: string): symbol {
  return (
    typeof Symbol !== undef ? Symbol(description) : `Symbol(${description})`
  ) as symbol;
}

export const Symbols = {
  Observable: createSymbol("Observable"),
  Proxy: createSymbol("Proxy"),
  Nothing: createSymbol("Nothing"),
  displayName: createSymbol("DisplayName"),
};
