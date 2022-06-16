/**
 * Copyright (c) 2014-present Houfeng
 * @homepage https://github.com/Houfeng/ober
 * @author Houfeng <houzhanfeng@gmail.com>
 */

import { AnyFunction, define, isArray, isFunction } from "./ObserveUtil";
import {
  Member,
  isArrowFunction,
  isBindRequiredFunction,
  isExtensible,
  isObject,
  isProxy,
  isValidKey,
} from "./ObserveUtil";
import { getOwnDescriptor, getValue, setValue } from "./ObserveReflect";

import { LowProxy } from "./ObserveShim";
import { ObserveConfig } from "./ObserveConfig";
import { ObserveSymbols } from "./ObserveSymbols";
import { UNDEF } from "./ObserveConstants";
import { checkStrictMode } from "./ObserveStrictMode";
import { notify } from "./ObserveBus";
import { observeInfo } from "./ObserveInfo";
import { report } from "./ObserveCollect";
import { throwError } from "./ObserveLogger";

export const NativeProxy = typeof Proxy !== UNDEF ? Proxy : null;

function useProxyClass() {
  switch (ObserveConfig.mode) {
    case "property":
      return LowProxy;
    case "auto":
      return NativeProxy || LowProxy;
    case "proxy":
    default:
      return NativeProxy;
  }
}

function isNativeProxy() {
  return NativeProxy === useProxyClass();
}

export function shouldAutoProxy(value: any): value is any {
  if (!value || !isObject(value) || !isExtensible(value)) return false;
  const ctor = value.constructor;
  return ctor === Object || ctor === Array;
}

function useBoundMethod(
  target: any,
  member: string,
  value: AnyFunction,
  receiver: any
) {
  if ((value as any)[ObserveSymbols.BoundMethod]) return value;
  const boundMethod = value.bind(receiver);
  define(boundMethod, ObserveSymbols.BoundMethod, true);
  define(target, member, boundMethod);
  return boundMethod;
}

function isSetArrayLength(target: any, member: Member) {
  return isArray(target) && member === "length";
}

export function createProxy<T extends object>(target: T): T {
  if (isProxy(target)) return target;
  const info = observeInfo(target);
  if (!info) return target;
  if (info.proxy) return info.proxy;
  const ObserveProxy = useProxyClass();
  if (!ObserveProxy) {
    const { mode } = ObserveConfig;
    throwError(`Current environment does not support '${mode}'`);
  }
  //创建 proxy
  info.proxy = new ObserveProxy(target, {
    //获取 descriptor 时
    getOwnPropertyDescriptor(target: any, member: Member) {
      if (member === ObserveSymbols.Proxy) {
        return { configurable: true, enumerable: false, value: true };
      }
      return getOwnDescriptor(target, member);
    },
    //读到数据时
    get(target: any, member: Member, receiver: any) {
      const value = getValue(target, member, receiver);
      if (!isValidKey(member)) return value;
      if (isNativeProxy() && isArrowFunction(value)) {
        throwError(`Proxy mode cannot have arrow function: ${member}`);
      }
      if (isBindRequiredFunction(value)) {
        return useBoundMethod(target, member, value, receiver);
      }
      if (isFunction(value)) return value;
      const proxy = shouldAutoProxy(value) ? createProxy(value) : value;
      report({ id: info.id, member, value });
      return proxy;
    },
    //更新数据时
    set(target: any, member: Member, value: any, receiver: any) {
      checkStrictMode();
      if (info.shadow[member] === value && !isSetArrayLength(target, member)) {
        return true;
      }
      setValue(target, member, value, receiver);
      info.shadow[member] = value;
      if (!isValidKey(member)) return true;
      notify({ id: info.id, member, value });
      return true;
    },
  }) as any;
  return info.proxy;
}
