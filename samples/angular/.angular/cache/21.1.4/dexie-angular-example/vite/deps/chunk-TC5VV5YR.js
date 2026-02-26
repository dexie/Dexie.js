import {
  AFTER_RENDER_SEQUENCES_TO_ADD,
  ANIMATIONS,
  CHILD_HEAD,
  CHILD_TAIL,
  CLEANUP,
  CONTAINER_HEADER_OFFSET,
  CONTEXT,
  ChangeDetectionScheduler,
  CheckNoChangesMode,
  DEBUG_TASK_TRACKER,
  DECLARATION_COMPONENT_VIEW,
  DECLARATION_LCONTAINER,
  DECLARATION_VIEW,
  DEHYDRATED_VIEWS,
  DOCUMENT,
  DOC_PAGE_BASE_URL,
  DestroyRef,
  EFFECTS,
  EFFECTS_TO_SCHEDULE,
  EMBEDDED_VIEW_INJECTOR,
  EMPTY_ARRAY,
  EMPTY_OBJ,
  ENVIRONMENT,
  ENVIRONMENT_INITIALIZER,
  ERROR_DETAILS_PAGE_BASE_URL,
  EffectRefImpl,
  EffectScheduler,
  EnvironmentInjector,
  ErrorHandler,
  FLAGS,
  HEADER_OFFSET,
  HOST,
  HYDRATION,
  ID,
  INJECTOR,
  INJECTOR_DEF_TYPES,
  INJECTOR_SCOPE,
  INTERNAL_APPLICATION_ERROR_HANDLER,
  InjectionToken,
  Injector,
  MATH_ML_NAMESPACE,
  MOVED_VIEWS,
  NATIVE,
  NEXT,
  NG_COMP_DEF,
  NG_DIR_DEF,
  NG_ELEMENT_ID,
  NG_FACTORY_DEF,
  NG_INJ_DEF,
  NG_MOD_DEF,
  NG_PIPE_DEF,
  NG_PROV_DEF,
  NgZone,
  NoopNgZone,
  NullInjector,
  ON_DESTROY_HOOKS,
  OutputEmitterRef,
  PARENT,
  PREORDER_HOOK_FLAGS,
  PROVIDED_ZONELESS,
  PendingTasks,
  PendingTasksInternal,
  QUERIES,
  R3Injector,
  REACTIVE_NODE,
  REACTIVE_TEMPLATE_CONSUMER,
  RENDERER,
  RuntimeError,
  SCHEDULE_IN_ROOT_ZONE,
  SCHEDULE_IN_ROOT_ZONE_DEFAULT,
  SIGNAL,
  SIGNAL_NODE,
  SVG_NAMESPACE,
  TVIEW,
  T_HOST,
  VIEW_REFS,
  ViewContext,
  XSS_SECURITY_URL,
  ZONELESS_ENABLED,
  _global,
  addToArray,
  angularZoneInstanceIdProperty,
  arrayEquals,
  arrayInsert2,
  arraySplice,
  assertComponentType,
  assertDefined,
  assertDirectiveDef,
  assertDomNode,
  assertElement,
  assertEqual,
  assertFirstCreatePass,
  assertFirstUpdatePass,
  assertFunction,
  assertGreaterThan,
  assertGreaterThanOrEqual,
  assertHasParent,
  assertInInjectionContext,
  assertIndexInDeclRange,
  assertIndexInExpandoRange,
  assertIndexInRange,
  assertInjectImplementationNotEqual,
  assertLContainer,
  assertLView,
  assertLessThan,
  assertNgModuleType,
  assertNodeInjector,
  assertNotDefined,
  assertNotEqual,
  assertNotInReactiveContext,
  assertNotReactive,
  assertNotSame,
  assertNumber,
  assertNumberInRange,
  assertOneOf,
  assertParentView,
  assertProjectionSlots,
  assertSame,
  assertString,
  assertTIcu,
  assertTNode,
  assertTNodeCreationIndex,
  assertTNodeForLView,
  assertTNodeForTView,
  attachInjectFlag,
  concatStringsWithSpace,
  consumerAfterComputation,
  consumerBeforeComputation,
  consumerDestroy,
  consumerPollProducersForChange,
  convertToBitFlags,
  createComputed,
  createInjectorWithoutInjectorInstances,
  cyclicDependencyError,
  cyclicDependencyErrorWithDetails,
  debugStringifyTypeForError,
  decreaseElementDepthCount,
  deepForEach,
  emitAfterRenderEffectPhaseCreatedEvent,
  emitInjectEvent,
  emitInjectorToCreateInstanceEvent,
  emitInstanceCreatedByInjectorEvent,
  emitProviderConfiguredEvent,
  enterDI,
  enterSkipHydrationBlock,
  enterView,
  errorHandlerEnvironmentInitializer,
  fillProperties,
  flatten,
  formatRuntimeError,
  forwardRef,
  getActiveConsumer,
  getBindingIndex,
  getBindingRoot,
  getBindingsEnabled,
  getClosureSafeProperty,
  getComponentDef,
  getComponentLViewByIndex,
  getConstant,
  getContextLView,
  getCurrentDirectiveDef,
  getCurrentDirectiveIndex,
  getCurrentParentTNode,
  getCurrentQueryIndex,
  getCurrentTNode,
  getCurrentTNodePlaceholderOk,
  getDirectiveDef,
  getDirectiveDefOrThrow,
  getElementDepthCount,
  getFactoryDef,
  getInjectorDef,
  getLView,
  getLViewParent,
  getNamespace,
  getNativeByIndex,
  getNativeByTNode,
  getNativeByTNodeOrNull,
  getNgModuleDef,
  getNgModuleDefOrThrow,
  getNullInjector,
  getOrCreateLViewCleanup,
  getOrCreateTViewCleanup,
  getPipeDef,
  getSelectedIndex,
  getSelectedTNode,
  getTNode,
  getTView,
  hasI18n,
  increaseElementDepthCount,
  incrementBindingIndex,
  initNgDevMode,
  inject,
  injectRootLimpMode,
  internalImportProvidersFrom,
  isClassProvider,
  isComponentDef,
  isComponentHost,
  isContentQueryHost,
  isCreationMode,
  isCurrentTNodeParent,
  isDestroyed,
  isDirectiveHost,
  isExhaustiveCheckNoChanges,
  isForwardRef,
  isInCheckNoChangesMode,
  isInI18nBlock,
  isInInjectionContext,
  isInSkipHydrationBlock,
  isLContainer,
  isLView,
  isProjectionTNode,
  isRefreshingViews,
  isRootView,
  isSkipHydrationRootTNode,
  isStandalone,
  isTypeProvider,
  keyValueArrayGet,
  keyValueArrayIndexOf,
  keyValueArraySet,
  lastNodeWasCreated,
  leaveDI,
  leaveSkipHydrationBlock,
  leaveView,
  load,
  makeEnvironmentProviders,
  markAncestorsForTraversal,
  markViewForRefresh,
  newArray,
  nextBindingIndex,
  nextContextImpl,
  producerAccessed,
  provideEnvironmentInitializer,
  providerToFactory,
  removeFromArray,
  removeLViewOnDestroy,
  renderStringify,
  requiresRefreshOrTraversal,
  resetPreOrderHookFlags,
  resolveForwardRef,
  runInInjectionContext,
  runInInjectorProfilerContext,
  scheduleCallbackWithMicrotask,
  scheduleCallbackWithRafRace,
  setActiveConsumer,
  setBindingIndex,
  setBindingRootForHostBindings,
  setCurrentDirectiveIndex,
  setCurrentQueryIndex,
  setCurrentTNode,
  setCurrentTNodeAsNotParent,
  setInI18nBlock,
  setInjectImplementation,
  setInjectorProfiler,
  setInjectorProfilerContext,
  setIsInCheckNoChangesMode,
  setIsRefreshingViews,
  setSelectedIndex,
  setThrowInvalidWriteToSignalError,
  signal,
  signalAsReadonlyFn,
  signalSetFn,
  store,
  storeCleanupWithContext,
  storeLViewOnDestroy,
  stringify,
  stringifyForError,
  throwError,
  throwProviderNotFoundError,
  untracked,
  unwrapLView,
  unwrapRNode,
  updateAncestorTraversalFlagsOnAttach,
  viewAttachedToChangeDetector,
  viewAttachedToContainer,
  walkProviderTree,
  walkUpViews,
  wasLastNodeCreated,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdisableBindings,
  ɵɵenableBindings,
  ɵɵinject,
  ɵɵinvalidFactoryDep,
  ɵɵnamespaceHTML,
  ɵɵnamespaceMathML,
  ɵɵnamespaceSVG,
  ɵɵresetView,
  ɵɵrestoreView
} from "./chunk-E4O526PW.js";
import {
  Subject,
  Subscription,
  map
} from "./chunk-RSS3ODKE.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-46DXP6YY.js";

// node_modules/@angular/core/fesm2022/_attribute-chunk.mjs
var Attribute = {
  JSACTION: "jsaction"
};

// node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs
function noSideEffects(fn) {
  return {
    toString: fn
  }.toString();
}
var ANNOTATIONS = "__annotations__";
var PARAMETERS = "__parameters__";
var PROP_METADATA = "__prop__metadata__";
function makeDecorator(name, props, parentClass, additionalProcessing, typeFn) {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);
    function DecoratorFactory(...args) {
      if (this instanceof DecoratorFactory) {
        metaCtor.call(this, ...args);
        return this;
      }
      const annotationInstance = new DecoratorFactory(...args);
      return function TypeDecorator(cls) {
        if (typeFn) typeFn(cls, ...args);
        const annotations = cls.hasOwnProperty(ANNOTATIONS) ? cls[ANNOTATIONS] : Object.defineProperty(cls, ANNOTATIONS, {
          value: []
        })[ANNOTATIONS];
        annotations.push(annotationInstance);
        return cls;
      };
    }
    if (parentClass) {
      DecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    DecoratorFactory.prototype.ngMetadataName = name;
    DecoratorFactory.annotationCls = DecoratorFactory;
    return DecoratorFactory;
  });
}
function makeMetadataCtor(props) {
  return function ctor(...args) {
    if (props) {
      const values = props(...args);
      for (const propName in values) {
        this[propName] = values[propName];
      }
    }
  };
}
function makeParamDecorator(name, props, parentClass) {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);
    function ParamDecoratorFactory(...args) {
      if (this instanceof ParamDecoratorFactory) {
        metaCtor.apply(this, args);
        return this;
      }
      const annotationInstance = new ParamDecoratorFactory(...args);
      ParamDecorator.annotation = annotationInstance;
      return ParamDecorator;
      function ParamDecorator(cls, unusedKey, index) {
        const parameters = cls.hasOwnProperty(PARAMETERS) ? cls[PARAMETERS] : Object.defineProperty(cls, PARAMETERS, {
          value: []
        })[PARAMETERS];
        while (parameters.length <= index) {
          parameters.push(null);
        }
        (parameters[index] = parameters[index] || []).push(annotationInstance);
        return cls;
      }
    }
    ParamDecoratorFactory.prototype.ngMetadataName = name;
    ParamDecoratorFactory.annotationCls = ParamDecoratorFactory;
    return ParamDecoratorFactory;
  });
}
function makePropDecorator(name, props, parentClass, additionalProcessing) {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);
    function PropDecoratorFactory(...args) {
      if (this instanceof PropDecoratorFactory) {
        metaCtor.apply(this, args);
        return this;
      }
      const decoratorInstance = new PropDecoratorFactory(...args);
      function PropDecorator(target, name2) {
        if (target === void 0) {
          throw new Error("Standard Angular field decorators are not supported in JIT mode.");
        }
        const constructor = target.constructor;
        const meta = constructor.hasOwnProperty(PROP_METADATA) ? constructor[PROP_METADATA] : Object.defineProperty(constructor, PROP_METADATA, {
          value: {}
        })[PROP_METADATA];
        meta[name2] = meta.hasOwnProperty(name2) && meta[name2] || [];
        meta[name2].unshift(decoratorInstance);
      }
      return PropDecorator;
    }
    if (parentClass) {
      PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    PropDecoratorFactory.prototype.ngMetadataName = name;
    PropDecoratorFactory.annotationCls = PropDecoratorFactory;
    return PropDecoratorFactory;
  });
}
var Inject = attachInjectFlag(makeParamDecorator("Inject", (token) => ({
  token
})), -1);
var Optional = attachInjectFlag(makeParamDecorator("Optional"), 8);
var Self = attachInjectFlag(makeParamDecorator("Self"), 2);
var SkipSelf = attachInjectFlag(makeParamDecorator("SkipSelf"), 4);
var Host = attachInjectFlag(makeParamDecorator("Host"), 1);
function getCompilerFacade(request) {
  const globalNg = _global["ng"];
  if (globalNg && globalNg.ɵcompilerFacade) {
    return globalNg.ɵcompilerFacade;
  }
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    console.error(`JIT compilation failed for ${request.kind}`, request.type);
    let message = `The ${request.kind} '${request.type.name}' needs to be compiled using the JIT compiler, but '@angular/compiler' is not available.

`;
    if (request.usage === 1) {
      message += `The ${request.kind} is part of a library that has been partially compiled.
`;
      message += `However, the Angular Linker has not processed the library such that JIT compilation is used as fallback.
`;
      message += "\n";
      message += `Ideally, the library is processed using the Angular Linker to become fully AOT compiled.
`;
    } else {
      message += `JIT compilation is discouraged for production use-cases! Consider using AOT mode instead.
`;
    }
    message += `Alternatively, the JIT compiler should be loaded by bootstrapping using '@angular/platform-browser-dynamic' or '@angular/platform-server',
`;
    message += `or manually provide the compiler with 'import "@angular/compiler";' before bootstrapping.`;
    throw new Error(message);
  } else {
    throw new Error("JIT compiler unavailable");
  }
}
var angularCoreDiEnv = {
  "ɵɵdefineInjectable": ɵɵdefineInjectable,
  "ɵɵdefineInjector": ɵɵdefineInjector,
  "ɵɵinject": ɵɵinject,
  "ɵɵinvalidFactoryDep": ɵɵinvalidFactoryDep,
  "resolveForwardRef": resolveForwardRef
};
var Type = Function;
function isType(v) {
  return typeof v === "function";
}
var ES5_DELEGATE_CTOR = /^function\s+\S+\(\)\s*{[\s\S]+\.apply\(this,\s*(arguments|(?:[^()]+\(\[\],)?[^()]+\(arguments\).*)\)/;
var ES2015_INHERITED_CLASS = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{/;
var ES2015_INHERITED_CLASS_WITH_CTOR = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{[\s\S]*constructor\s*\(/;
var ES2015_INHERITED_CLASS_WITH_DELEGATE_CTOR = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{[\s\S]*constructor\s*\(\)\s*{[^}]*super\(\.\.\.arguments\)/;
function isDelegateCtor(typeStr) {
  return ES5_DELEGATE_CTOR.test(typeStr) || ES2015_INHERITED_CLASS_WITH_DELEGATE_CTOR.test(typeStr) || ES2015_INHERITED_CLASS.test(typeStr) && !ES2015_INHERITED_CLASS_WITH_CTOR.test(typeStr);
}
var ReflectionCapabilities = class {
  _reflect;
  constructor(reflect) {
    this._reflect = reflect || _global["Reflect"];
  }
  factory(t) {
    return (...args) => new t(...args);
  }
  _zipTypesAndAnnotations(paramTypes, paramAnnotations) {
    let result;
    if (typeof paramTypes === "undefined") {
      result = newArray(paramAnnotations.length);
    } else {
      result = newArray(paramTypes.length);
    }
    for (let i = 0; i < result.length; i++) {
      if (typeof paramTypes === "undefined") {
        result[i] = [];
      } else if (paramTypes[i] && paramTypes[i] != Object) {
        result[i] = [paramTypes[i]];
      } else {
        result[i] = [];
      }
      if (paramAnnotations && paramAnnotations[i] != null) {
        result[i] = result[i].concat(paramAnnotations[i]);
      }
    }
    return result;
  }
  _ownParameters(type, parentCtor) {
    const typeStr = type.toString();
    if (isDelegateCtor(typeStr)) {
      return null;
    }
    if (type.parameters && type.parameters !== parentCtor.parameters) {
      return type.parameters;
    }
    const tsickleCtorParams = type.ctorParameters;
    if (tsickleCtorParams && tsickleCtorParams !== parentCtor.ctorParameters) {
      const ctorParameters = typeof tsickleCtorParams === "function" ? tsickleCtorParams() : tsickleCtorParams;
      const paramTypes2 = ctorParameters.map((ctorParam) => ctorParam && ctorParam.type);
      const paramAnnotations2 = ctorParameters.map((ctorParam) => ctorParam && convertTsickleDecoratorIntoMetadata(ctorParam.decorators));
      return this._zipTypesAndAnnotations(paramTypes2, paramAnnotations2);
    }
    const paramAnnotations = type.hasOwnProperty(PARAMETERS) && type[PARAMETERS];
    const paramTypes = this._reflect && this._reflect.getOwnMetadata && this._reflect.getOwnMetadata("design:paramtypes", type);
    if (paramTypes || paramAnnotations) {
      return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
    }
    return newArray(type.length);
  }
  parameters(type) {
    if (!isType(type)) {
      return [];
    }
    const parentCtor = getParentCtor(type);
    let parameters = this._ownParameters(type, parentCtor);
    if (!parameters && parentCtor !== Object) {
      parameters = this.parameters(parentCtor);
    }
    return parameters || [];
  }
  _ownAnnotations(typeOrFunc, parentCtor) {
    if (typeOrFunc.annotations && typeOrFunc.annotations !== parentCtor.annotations) {
      let annotations = typeOrFunc.annotations;
      if (typeof annotations === "function" && annotations.annotations) {
        annotations = annotations.annotations;
      }
      return annotations;
    }
    if (typeOrFunc.decorators && typeOrFunc.decorators !== parentCtor.decorators) {
      return convertTsickleDecoratorIntoMetadata(typeOrFunc.decorators);
    }
    if (typeOrFunc.hasOwnProperty(ANNOTATIONS)) {
      return typeOrFunc[ANNOTATIONS];
    }
    return null;
  }
  annotations(typeOrFunc) {
    if (!isType(typeOrFunc)) {
      return [];
    }
    const parentCtor = getParentCtor(typeOrFunc);
    const ownAnnotations = this._ownAnnotations(typeOrFunc, parentCtor) || [];
    const parentAnnotations = parentCtor !== Object ? this.annotations(parentCtor) : [];
    return parentAnnotations.concat(ownAnnotations);
  }
  _ownPropMetadata(typeOrFunc, parentCtor) {
    if (typeOrFunc.propMetadata && typeOrFunc.propMetadata !== parentCtor.propMetadata) {
      let propMetadata = typeOrFunc.propMetadata;
      if (typeof propMetadata === "function" && propMetadata.propMetadata) {
        propMetadata = propMetadata.propMetadata;
      }
      return propMetadata;
    }
    if (typeOrFunc.propDecorators && typeOrFunc.propDecorators !== parentCtor.propDecorators) {
      const propDecorators = typeOrFunc.propDecorators;
      const propMetadata = {};
      Object.keys(propDecorators).forEach((prop) => {
        propMetadata[prop] = convertTsickleDecoratorIntoMetadata(propDecorators[prop]);
      });
      return propMetadata;
    }
    if (typeOrFunc.hasOwnProperty(PROP_METADATA)) {
      return typeOrFunc[PROP_METADATA];
    }
    return null;
  }
  propMetadata(typeOrFunc) {
    if (!isType(typeOrFunc)) {
      return {};
    }
    const parentCtor = getParentCtor(typeOrFunc);
    const propMetadata = {};
    if (parentCtor !== Object) {
      const parentPropMetadata = this.propMetadata(parentCtor);
      Object.keys(parentPropMetadata).forEach((propName) => {
        propMetadata[propName] = parentPropMetadata[propName];
      });
    }
    const ownPropMetadata = this._ownPropMetadata(typeOrFunc, parentCtor);
    if (ownPropMetadata) {
      Object.keys(ownPropMetadata).forEach((propName) => {
        const decorators = [];
        if (propMetadata.hasOwnProperty(propName)) {
          decorators.push(...propMetadata[propName]);
        }
        decorators.push(...ownPropMetadata[propName]);
        propMetadata[propName] = decorators;
      });
    }
    return propMetadata;
  }
  ownPropMetadata(typeOrFunc) {
    if (!isType(typeOrFunc)) {
      return {};
    }
    return this._ownPropMetadata(typeOrFunc, getParentCtor(typeOrFunc)) || {};
  }
  hasLifecycleHook(type, lcProperty) {
    return type instanceof Type && lcProperty in type.prototype;
  }
};
function convertTsickleDecoratorIntoMetadata(decoratorInvocations) {
  if (!decoratorInvocations) {
    return [];
  }
  return decoratorInvocations.map((decoratorInvocation) => {
    const decoratorType = decoratorInvocation.type;
    const annotationCls = decoratorType.annotationCls;
    const annotationArgs = decoratorInvocation.args ? decoratorInvocation.args : [];
    return new annotationCls(...annotationArgs);
  });
}
function getParentCtor(ctor) {
  const parentProto = ctor.prototype ? Object.getPrototypeOf(ctor.prototype) : null;
  const parentCtor = parentProto ? parentProto.constructor : null;
  return parentCtor || Object;
}
function applyValueToInputField(instance, inputSignalNode, privateName, value) {
  if (inputSignalNode !== null) {
    inputSignalNode.applyValueToInputSignal(inputSignalNode, value);
  } else {
    instance[privateName] = value;
  }
}
var SimpleChange = class {
  previousValue;
  currentValue;
  firstChange;
  constructor(previousValue, currentValue, firstChange) {
    this.previousValue = previousValue;
    this.currentValue = currentValue;
    this.firstChange = firstChange;
  }
  isFirstChange() {
    return this.firstChange;
  }
};
var ɵɵNgOnChangesFeature = (() => {
  const ɵɵNgOnChangesFeatureImpl = () => NgOnChangesFeatureImpl;
  ɵɵNgOnChangesFeatureImpl.ngInherit = true;
  return ɵɵNgOnChangesFeatureImpl;
})();
function NgOnChangesFeatureImpl(definition) {
  if (definition.type.prototype.ngOnChanges) {
    definition.setInput = ngOnChangesSetInput;
  }
  return rememberChangeHistoryAndInvokeOnChangesHook;
}
function rememberChangeHistoryAndInvokeOnChangesHook() {
  const simpleChangesStore = getSimpleChangesStore(this);
  const current = simpleChangesStore?.current;
  if (current) {
    const previous = simpleChangesStore.previous;
    if (previous === EMPTY_OBJ) {
      simpleChangesStore.previous = current;
    } else {
      for (let key in current) {
        previous[key] = current[key];
      }
    }
    simpleChangesStore.current = null;
    this.ngOnChanges(current);
  }
}
function ngOnChangesSetInput(instance, inputSignalNode, value, publicName, privateName) {
  const declaredName = this.declaredInputs[publicName];
  ngDevMode && assertString(declaredName, "Name of input in ngOnChanges has to be a string");
  const simpleChangesStore = getSimpleChangesStore(instance) || setSimpleChangesStore(instance, {
    previous: EMPTY_OBJ,
    current: null
  });
  const current = simpleChangesStore.current || (simpleChangesStore.current = {});
  const previous = simpleChangesStore.previous;
  const previousChange = previous[declaredName];
  current[declaredName] = new SimpleChange(previousChange && previousChange.currentValue, value, previous === EMPTY_OBJ);
  applyValueToInputField(instance, inputSignalNode, privateName, value);
}
var SIMPLE_CHANGES_STORE = "__ngSimpleChanges__";
function getSimpleChangesStore(instance) {
  return instance[SIMPLE_CHANGES_STORE] || null;
}
function setSimpleChangesStore(instance, store2) {
  return instance[SIMPLE_CHANGES_STORE] = store2;
}
var profilerCallbacks = [];
var NOOP_PROFILER_REMOVAL = () => {
};
function removeProfiler(profiler2) {
  const profilerIdx = profilerCallbacks.indexOf(profiler2);
  if (profilerIdx !== -1) {
    profilerCallbacks.splice(profilerIdx, 1);
  }
}
function setProfiler(profiler2) {
  if (profiler2 !== null) {
    if (!profilerCallbacks.includes(profiler2)) {
      profilerCallbacks.push(profiler2);
    }
    return () => removeProfiler(profiler2);
  } else {
    profilerCallbacks.length = 0;
    return NOOP_PROFILER_REMOVAL;
  }
}
var profiler = function(event, instance = null, eventFn) {
  for (let i = 0; i < profilerCallbacks.length; i++) {
    const profilerCallback = profilerCallbacks[i];
    profilerCallback(event, instance, eventFn);
  }
};
var ProfilerEvent;
(function(ProfilerEvent2) {
  ProfilerEvent2[ProfilerEvent2["TemplateCreateStart"] = 0] = "TemplateCreateStart";
  ProfilerEvent2[ProfilerEvent2["TemplateCreateEnd"] = 1] = "TemplateCreateEnd";
  ProfilerEvent2[ProfilerEvent2["TemplateUpdateStart"] = 2] = "TemplateUpdateStart";
  ProfilerEvent2[ProfilerEvent2["TemplateUpdateEnd"] = 3] = "TemplateUpdateEnd";
  ProfilerEvent2[ProfilerEvent2["LifecycleHookStart"] = 4] = "LifecycleHookStart";
  ProfilerEvent2[ProfilerEvent2["LifecycleHookEnd"] = 5] = "LifecycleHookEnd";
  ProfilerEvent2[ProfilerEvent2["OutputStart"] = 6] = "OutputStart";
  ProfilerEvent2[ProfilerEvent2["OutputEnd"] = 7] = "OutputEnd";
  ProfilerEvent2[ProfilerEvent2["BootstrapApplicationStart"] = 8] = "BootstrapApplicationStart";
  ProfilerEvent2[ProfilerEvent2["BootstrapApplicationEnd"] = 9] = "BootstrapApplicationEnd";
  ProfilerEvent2[ProfilerEvent2["BootstrapComponentStart"] = 10] = "BootstrapComponentStart";
  ProfilerEvent2[ProfilerEvent2["BootstrapComponentEnd"] = 11] = "BootstrapComponentEnd";
  ProfilerEvent2[ProfilerEvent2["ChangeDetectionStart"] = 12] = "ChangeDetectionStart";
  ProfilerEvent2[ProfilerEvent2["ChangeDetectionEnd"] = 13] = "ChangeDetectionEnd";
  ProfilerEvent2[ProfilerEvent2["ChangeDetectionSyncStart"] = 14] = "ChangeDetectionSyncStart";
  ProfilerEvent2[ProfilerEvent2["ChangeDetectionSyncEnd"] = 15] = "ChangeDetectionSyncEnd";
  ProfilerEvent2[ProfilerEvent2["AfterRenderHooksStart"] = 16] = "AfterRenderHooksStart";
  ProfilerEvent2[ProfilerEvent2["AfterRenderHooksEnd"] = 17] = "AfterRenderHooksEnd";
  ProfilerEvent2[ProfilerEvent2["ComponentStart"] = 18] = "ComponentStart";
  ProfilerEvent2[ProfilerEvent2["ComponentEnd"] = 19] = "ComponentEnd";
  ProfilerEvent2[ProfilerEvent2["DeferBlockStateStart"] = 20] = "DeferBlockStateStart";
  ProfilerEvent2[ProfilerEvent2["DeferBlockStateEnd"] = 21] = "DeferBlockStateEnd";
  ProfilerEvent2[ProfilerEvent2["DynamicComponentStart"] = 22] = "DynamicComponentStart";
  ProfilerEvent2[ProfilerEvent2["DynamicComponentEnd"] = 23] = "DynamicComponentEnd";
  ProfilerEvent2[ProfilerEvent2["HostBindingsUpdateStart"] = 24] = "HostBindingsUpdateStart";
  ProfilerEvent2[ProfilerEvent2["HostBindingsUpdateEnd"] = 25] = "HostBindingsUpdateEnd";
})(ProfilerEvent || (ProfilerEvent = {}));
function registerPreOrderHooks(directiveIndex, directiveDef, tView) {
  ngDevMode && assertFirstCreatePass(tView);
  const {
    ngOnChanges,
    ngOnInit,
    ngDoCheck
  } = directiveDef.type.prototype;
  if (ngOnChanges) {
    const wrappedOnChanges = NgOnChangesFeatureImpl(directiveDef);
    (tView.preOrderHooks ??= []).push(directiveIndex, wrappedOnChanges);
    (tView.preOrderCheckHooks ??= []).push(directiveIndex, wrappedOnChanges);
  }
  if (ngOnInit) {
    (tView.preOrderHooks ??= []).push(0 - directiveIndex, ngOnInit);
  }
  if (ngDoCheck) {
    (tView.preOrderHooks ??= []).push(directiveIndex, ngDoCheck);
    (tView.preOrderCheckHooks ??= []).push(directiveIndex, ngDoCheck);
  }
}
function registerPostOrderHooks(tView, tNode) {
  ngDevMode && assertFirstCreatePass(tView);
  for (let i = tNode.directiveStart, end = tNode.directiveEnd; i < end; i++) {
    const directiveDef = tView.data[i];
    ngDevMode && assertDefined(directiveDef, "Expecting DirectiveDef");
    const lifecycleHooks = directiveDef.type.prototype;
    const {
      ngAfterContentInit,
      ngAfterContentChecked,
      ngAfterViewInit,
      ngAfterViewChecked,
      ngOnDestroy
    } = lifecycleHooks;
    if (ngAfterContentInit) {
      (tView.contentHooks ??= []).push(-i, ngAfterContentInit);
    }
    if (ngAfterContentChecked) {
      (tView.contentHooks ??= []).push(i, ngAfterContentChecked);
      (tView.contentCheckHooks ??= []).push(i, ngAfterContentChecked);
    }
    if (ngAfterViewInit) {
      (tView.viewHooks ??= []).push(-i, ngAfterViewInit);
    }
    if (ngAfterViewChecked) {
      (tView.viewHooks ??= []).push(i, ngAfterViewChecked);
      (tView.viewCheckHooks ??= []).push(i, ngAfterViewChecked);
    }
    if (ngOnDestroy != null) {
      (tView.destroyHooks ??= []).push(i, ngOnDestroy);
    }
  }
}
function executeCheckHooks(lView, hooks, nodeIndex) {
  callHooks(lView, hooks, 3, nodeIndex);
}
function executeInitAndCheckHooks(lView, hooks, initPhase, nodeIndex) {
  ngDevMode && assertNotEqual(initPhase, 3, "Init pre-order hooks should not be called more than once");
  if ((lView[FLAGS] & 3) === initPhase) {
    callHooks(lView, hooks, initPhase, nodeIndex);
  }
}
function incrementInitPhaseFlags(lView, initPhase) {
  ngDevMode && assertNotEqual(initPhase, 3, "Init hooks phase should not be incremented after all init hooks have been run.");
  let flags = lView[FLAGS];
  if ((flags & 3) === initPhase) {
    flags &= 16383;
    flags += 1;
    lView[FLAGS] = flags;
  }
}
function callHooks(currentView, arr, initPhase, currentNodeIndex) {
  ngDevMode && assertEqual(isInCheckNoChangesMode(), false, "Hooks should never be run when in check no changes mode.");
  const startIndex = currentNodeIndex !== void 0 ? currentView[PREORDER_HOOK_FLAGS] & 65535 : 0;
  const nodeIndexLimit = currentNodeIndex != null ? currentNodeIndex : -1;
  const max = arr.length - 1;
  let lastNodeIndexFound = 0;
  for (let i = startIndex; i < max; i++) {
    const hook = arr[i + 1];
    if (typeof hook === "number") {
      lastNodeIndexFound = arr[i];
      if (currentNodeIndex != null && lastNodeIndexFound >= currentNodeIndex) {
        break;
      }
    } else {
      const isInitHook = arr[i] < 0;
      if (isInitHook) {
        currentView[PREORDER_HOOK_FLAGS] += 65536;
      }
      if (lastNodeIndexFound < nodeIndexLimit || nodeIndexLimit == -1) {
        callHook(currentView, initPhase, arr, i);
        currentView[PREORDER_HOOK_FLAGS] = (currentView[PREORDER_HOOK_FLAGS] & 4294901760) + i + 2;
      }
      i++;
    }
  }
}
function callHookInternal(directive, hook) {
  profiler(ProfilerEvent.LifecycleHookStart, directive, hook);
  const prevConsumer = setActiveConsumer(null);
  try {
    hook.call(directive);
  } finally {
    setActiveConsumer(prevConsumer);
    profiler(ProfilerEvent.LifecycleHookEnd, directive, hook);
  }
}
function callHook(currentView, initPhase, arr, i) {
  const isInitHook = arr[i] < 0;
  const hook = arr[i + 1];
  const directiveIndex = isInitHook ? -arr[i] : arr[i];
  const directive = currentView[directiveIndex];
  if (isInitHook) {
    const indexWithintInitPhase = currentView[FLAGS] >> 14;
    if (indexWithintInitPhase < currentView[PREORDER_HOOK_FLAGS] >> 16 && (currentView[FLAGS] & 3) === initPhase) {
      currentView[FLAGS] += 16384;
      callHookInternal(directive, hook);
    }
  } else {
    callHookInternal(directive, hook);
  }
}
var NO_PARENT_INJECTOR = -1;
var NodeInjectorFactory = class {
  factory;
  name;
  injectImpl;
  resolving = false;
  canSeeViewProviders;
  multi;
  componentProviders;
  index;
  providerFactory;
  constructor(factory, isViewProvider, injectImplementation, name) {
    this.factory = factory;
    this.name = name;
    ngDevMode && assertDefined(factory, "Factory not specified");
    ngDevMode && assertEqual(typeof factory, "function", "Expected factory function.");
    this.canSeeViewProviders = isViewProvider;
    this.injectImpl = injectImplementation;
  }
};
function toTNodeTypeAsString(tNodeType) {
  let text = "";
  tNodeType & 1 && (text += "|Text");
  tNodeType & 2 && (text += "|Element");
  tNodeType & 4 && (text += "|Container");
  tNodeType & 8 && (text += "|ElementContainer");
  tNodeType & 16 && (text += "|Projection");
  tNodeType & 32 && (text += "|IcuContainer");
  tNodeType & 64 && (text += "|Placeholder");
  tNodeType & 128 && (text += "|LetDeclaration");
  return text.length > 0 ? text.substring(1) : text;
}
function isTNodeShape(value) {
  return value != null && typeof value === "object" && (value.insertBeforeIndex === null || typeof value.insertBeforeIndex === "number" || Array.isArray(value.insertBeforeIndex));
}
function isLetDeclaration(tNode) {
  return !!(tNode.type & 128);
}
function hasClassInput(tNode) {
  return (tNode.flags & 8) !== 0;
}
function hasStyleInput(tNode) {
  return (tNode.flags & 16) !== 0;
}
function assertTNodeType(tNode, expectedTypes, message) {
  assertDefined(tNode, "should be called with a TNode");
  if ((tNode.type & expectedTypes) === 0) {
    throwError(message || `Expected [${toTNodeTypeAsString(expectedTypes)}] but got ${toTNodeTypeAsString(tNode.type)}.`);
  }
}
function assertPureTNodeType(type) {
  if (!(type === 2 || type === 1 || type === 4 || type === 8 || type === 32 || type === 16 || type === 64 || type === 128)) {
    throwError(`Expected TNodeType to have only a single type selected, but got ${toTNodeTypeAsString(type)}.`);
  }
}
function setUpAttributes(renderer, native, attrs) {
  let i = 0;
  while (i < attrs.length) {
    const value = attrs[i];
    if (typeof value === "number") {
      if (value !== 0) {
        break;
      }
      i++;
      const namespaceURI = attrs[i++];
      const attrName = attrs[i++];
      const attrVal = attrs[i++];
      renderer.setAttribute(native, attrName, attrVal, namespaceURI);
    } else {
      const attrName = value;
      const attrVal = attrs[++i];
      if (isAnimationProp(attrName)) {
        renderer.setProperty(native, attrName, attrVal);
      } else {
        renderer.setAttribute(native, attrName, attrVal);
      }
      i++;
    }
  }
  return i;
}
function isNameOnlyAttributeMarker(marker) {
  return marker === 3 || marker === 4 || marker === 6;
}
function isAnimationProp(name) {
  return name.charCodeAt(0) === 64;
}
function mergeHostAttrs(dst, src) {
  if (src === null || src.length === 0) ;
  else if (dst === null || dst.length === 0) {
    dst = src.slice();
  } else {
    let srcMarker = -1;
    for (let i = 0; i < src.length; i++) {
      const item = src[i];
      if (typeof item === "number") {
        srcMarker = item;
      } else {
        if (srcMarker === 0) ;
        else if (srcMarker === -1 || srcMarker === 2) {
          mergeHostAttribute(dst, srcMarker, item, null, src[++i]);
        } else {
          mergeHostAttribute(dst, srcMarker, item, null, null);
        }
      }
    }
  }
  return dst;
}
function mergeHostAttribute(dst, marker, key1, key2, value) {
  let i = 0;
  let markerInsertPosition = dst.length;
  if (marker === -1) {
    markerInsertPosition = -1;
  } else {
    while (i < dst.length) {
      const dstValue = dst[i++];
      if (typeof dstValue === "number") {
        if (dstValue === marker) {
          markerInsertPosition = -1;
          break;
        } else if (dstValue > marker) {
          markerInsertPosition = i - 1;
          break;
        }
      }
    }
  }
  while (i < dst.length) {
    const item = dst[i];
    if (typeof item === "number") {
      break;
    } else if (item === key1) {
      {
        if (value !== null) {
          dst[i + 1] = value;
        }
        return;
      }
    }
    i++;
    if (value !== null) i++;
  }
  if (markerInsertPosition !== -1) {
    dst.splice(markerInsertPosition, 0, marker);
    i = markerInsertPosition + 1;
  }
  dst.splice(i++, 0, key1);
  if (value !== null) {
    dst.splice(i++, 0, value);
  }
}
function hasParentInjector(parentLocation) {
  return parentLocation !== NO_PARENT_INJECTOR;
}
function getParentInjectorIndex(parentLocation) {
  if (ngDevMode) {
    assertNumber(parentLocation, "Number expected");
    assertNotEqual(parentLocation, -1, "Not a valid state.");
    const parentInjectorIndex = parentLocation & 32767;
    assertGreaterThan(parentInjectorIndex, HEADER_OFFSET, "Parent injector must be pointing past HEADER_OFFSET.");
  }
  return parentLocation & 32767;
}
function getParentInjectorViewOffset(parentLocation) {
  return parentLocation >> 16;
}
function getParentInjectorView(location, startView) {
  let viewOffset = getParentInjectorViewOffset(location);
  let parentView = startView;
  while (viewOffset > 0) {
    parentView = parentView[DECLARATION_VIEW];
    viewOffset--;
  }
  return parentView;
}
var includeViewProviders = true;
function setIncludeViewProviders(v) {
  const oldValue = includeViewProviders;
  includeViewProviders = v;
  return oldValue;
}
var BLOOM_SIZE = 256;
var BLOOM_MASK = BLOOM_SIZE - 1;
var BLOOM_BUCKET_BITS = 5;
var nextNgElementId = 0;
var NOT_FOUND = {};
function bloomAdd(injectorIndex, tView, type) {
  ngDevMode && assertEqual(tView.firstCreatePass, true, "expected firstCreatePass to be true");
  let id;
  if (typeof type === "string") {
    id = type.charCodeAt(0) || 0;
  } else if (type.hasOwnProperty(NG_ELEMENT_ID)) {
    id = type[NG_ELEMENT_ID];
  }
  if (id == null) {
    id = type[NG_ELEMENT_ID] = nextNgElementId++;
  }
  const bloomHash = id & BLOOM_MASK;
  const mask = 1 << bloomHash;
  tView.data[injectorIndex + (bloomHash >> BLOOM_BUCKET_BITS)] |= mask;
}
function getOrCreateNodeInjectorForNode(tNode, lView) {
  const existingInjectorIndex = getInjectorIndex(tNode, lView);
  if (existingInjectorIndex !== -1) {
    return existingInjectorIndex;
  }
  const tView = lView[TVIEW];
  if (tView.firstCreatePass) {
    tNode.injectorIndex = lView.length;
    insertBloom(tView.data, tNode);
    insertBloom(lView, null);
    insertBloom(tView.blueprint, null);
  }
  const parentLoc = getParentInjectorLocation(tNode, lView);
  const injectorIndex = tNode.injectorIndex;
  if (hasParentInjector(parentLoc)) {
    const parentIndex = getParentInjectorIndex(parentLoc);
    const parentLView = getParentInjectorView(parentLoc, lView);
    const parentData = parentLView[TVIEW].data;
    for (let i = 0; i < 8; i++) {
      lView[injectorIndex + i] = parentLView[parentIndex + i] | parentData[parentIndex + i];
    }
  }
  lView[injectorIndex + 8] = parentLoc;
  return injectorIndex;
}
function insertBloom(arr, footer) {
  arr.push(0, 0, 0, 0, 0, 0, 0, 0, footer);
}
function getInjectorIndex(tNode, lView) {
  if (tNode.injectorIndex === -1 || tNode.parent && tNode.parent.injectorIndex === tNode.injectorIndex || lView[tNode.injectorIndex + 8] === null) {
    return -1;
  } else {
    ngDevMode && assertIndexInRange(lView, tNode.injectorIndex);
    return tNode.injectorIndex;
  }
}
function getParentInjectorLocation(tNode, lView) {
  if (tNode.parent && tNode.parent.injectorIndex !== -1) {
    return tNode.parent.injectorIndex;
  }
  let declarationViewOffset = 0;
  let parentTNode = null;
  let lViewCursor = lView;
  while (lViewCursor !== null) {
    parentTNode = getTNodeFromLView(lViewCursor);
    if (parentTNode === null) {
      return NO_PARENT_INJECTOR;
    }
    ngDevMode && parentTNode && assertTNodeForLView(parentTNode, lViewCursor[DECLARATION_VIEW]);
    declarationViewOffset++;
    lViewCursor = lViewCursor[DECLARATION_VIEW];
    if (parentTNode.injectorIndex !== -1) {
      return parentTNode.injectorIndex | declarationViewOffset << 16;
    }
  }
  return NO_PARENT_INJECTOR;
}
function diPublicInInjector(injectorIndex, tView, token) {
  bloomAdd(injectorIndex, tView, token);
}
function injectAttributeImpl(tNode, attrNameToInject) {
  ngDevMode && assertTNodeType(tNode, 12 | 3);
  ngDevMode && assertDefined(tNode, "expecting tNode");
  if (attrNameToInject === "class") {
    return tNode.classes;
  }
  if (attrNameToInject === "style") {
    return tNode.styles;
  }
  const attrs = tNode.attrs;
  if (attrs) {
    const attrsLength = attrs.length;
    let i = 0;
    while (i < attrsLength) {
      const value = attrs[i];
      if (isNameOnlyAttributeMarker(value)) break;
      if (value === 0) {
        i = i + 2;
      } else if (typeof value === "number") {
        i++;
        while (i < attrsLength && typeof attrs[i] === "string") {
          i++;
        }
      } else if (value === attrNameToInject) {
        return attrs[i + 1];
      } else {
        i = i + 2;
      }
    }
  }
  return null;
}
function notFoundValueOrThrow(notFoundValue, token, flags) {
  if (flags & 8 || notFoundValue !== void 0) {
    return notFoundValue;
  } else {
    throwProviderNotFoundError(token, "NodeInjector");
  }
}
function lookupTokenUsingModuleInjector(lView, token, flags, notFoundValue) {
  if (flags & 8 && notFoundValue === void 0) {
    notFoundValue = null;
  }
  if ((flags & (2 | 1)) === 0) {
    const moduleInjector = lView[INJECTOR];
    const previousInjectImplementation = setInjectImplementation(void 0);
    try {
      if (moduleInjector) {
        return moduleInjector.get(token, notFoundValue, flags & 8);
      } else {
        return injectRootLimpMode(token, notFoundValue, flags & 8);
      }
    } finally {
      setInjectImplementation(previousInjectImplementation);
    }
  }
  return notFoundValueOrThrow(notFoundValue, token, flags);
}
function getOrCreateInjectable(tNode, lView, token, flags = 0, notFoundValue) {
  if (tNode !== null) {
    if (lView[FLAGS] & 2048 && !(flags & 2)) {
      const embeddedInjectorValue = lookupTokenUsingEmbeddedInjector(tNode, lView, token, flags, NOT_FOUND);
      if (embeddedInjectorValue !== NOT_FOUND) {
        return embeddedInjectorValue;
      }
    }
    const value = lookupTokenUsingNodeInjector(tNode, lView, token, flags, NOT_FOUND);
    if (value !== NOT_FOUND) {
      return value;
    }
  }
  return lookupTokenUsingModuleInjector(lView, token, flags, notFoundValue);
}
function lookupTokenUsingNodeInjector(tNode, lView, token, flags, notFoundValue) {
  const bloomHash = bloomHashBitOrFactory(token);
  if (typeof bloomHash === "function") {
    if (!enterDI(lView, tNode, flags)) {
      return flags & 1 ? notFoundValueOrThrow(notFoundValue, token, flags) : lookupTokenUsingModuleInjector(lView, token, flags, notFoundValue);
    }
    try {
      let value;
      if (ngDevMode) {
        runInInjectorProfilerContext(new NodeInjector(getCurrentTNode(), getLView()), token, () => {
          emitInjectorToCreateInstanceEvent(token);
          value = bloomHash(flags);
          emitInstanceCreatedByInjectorEvent(value);
        });
      } else {
        value = bloomHash(flags);
      }
      if (value == null && !(flags & 8)) {
        throwProviderNotFoundError(token);
      } else {
        return value;
      }
    } finally {
      leaveDI();
    }
  } else if (typeof bloomHash === "number") {
    let previousTView = null;
    let injectorIndex = getInjectorIndex(tNode, lView);
    let parentLocation = NO_PARENT_INJECTOR;
    let hostTElementNode = flags & 1 ? lView[DECLARATION_COMPONENT_VIEW][T_HOST] : null;
    if (injectorIndex === -1 || flags & 4) {
      parentLocation = injectorIndex === -1 ? getParentInjectorLocation(tNode, lView) : lView[injectorIndex + 8];
      if (parentLocation === NO_PARENT_INJECTOR || !shouldSearchParent(flags, false)) {
        injectorIndex = -1;
      } else {
        previousTView = lView[TVIEW];
        injectorIndex = getParentInjectorIndex(parentLocation);
        lView = getParentInjectorView(parentLocation, lView);
      }
    }
    while (injectorIndex !== -1) {
      ngDevMode && assertNodeInjector(lView, injectorIndex);
      const tView = lView[TVIEW];
      ngDevMode && assertTNodeForLView(tView.data[injectorIndex + 8], lView);
      if (bloomHasToken(bloomHash, injectorIndex, tView.data)) {
        const instance = searchTokensOnInjector(injectorIndex, lView, token, previousTView, flags, hostTElementNode);
        if (instance !== NOT_FOUND) {
          return instance;
        }
      }
      parentLocation = lView[injectorIndex + 8];
      if (parentLocation !== NO_PARENT_INJECTOR && shouldSearchParent(flags, lView[TVIEW].data[injectorIndex + 8] === hostTElementNode) && bloomHasToken(bloomHash, injectorIndex, lView)) {
        previousTView = tView;
        injectorIndex = getParentInjectorIndex(parentLocation);
        lView = getParentInjectorView(parentLocation, lView);
      } else {
        injectorIndex = -1;
      }
    }
  }
  return notFoundValue;
}
function searchTokensOnInjector(injectorIndex, lView, token, previousTView, flags, hostTElementNode) {
  const currentTView = lView[TVIEW];
  const tNode = currentTView.data[injectorIndex + 8];
  const canAccessViewProviders = previousTView == null ? isComponentHost(tNode) && includeViewProviders : previousTView != currentTView && (tNode.type & 3) !== 0;
  const isHostSpecialCase = flags & 1 && hostTElementNode === tNode;
  const injectableIdx = locateDirectiveOrProvider(tNode, currentTView, token, canAccessViewProviders, isHostSpecialCase);
  if (injectableIdx !== null) {
    return getNodeInjectable(lView, currentTView, injectableIdx, tNode, flags);
  } else {
    return NOT_FOUND;
  }
}
function locateDirectiveOrProvider(tNode, tView, token, canAccessViewProviders, isHostSpecialCase) {
  const nodeProviderIndexes = tNode.providerIndexes;
  const tInjectables = tView.data;
  const injectablesStart = nodeProviderIndexes & 1048575;
  const directivesStart = tNode.directiveStart;
  const directiveEnd = tNode.directiveEnd;
  const cptViewProvidersCount = nodeProviderIndexes >> 20;
  const startingIndex = canAccessViewProviders ? injectablesStart : injectablesStart + cptViewProvidersCount;
  const endIndex = isHostSpecialCase ? injectablesStart + cptViewProvidersCount : directiveEnd;
  for (let i = startingIndex; i < endIndex; i++) {
    const providerTokenOrDef = tInjectables[i];
    if (i < directivesStart && token === providerTokenOrDef || i >= directivesStart && providerTokenOrDef.type === token) {
      return i;
    }
  }
  if (isHostSpecialCase) {
    const dirDef = tInjectables[directivesStart];
    if (dirDef && isComponentDef(dirDef) && dirDef.type === token) {
      return directivesStart;
    }
  }
  return null;
}
var injectionPath = [];
function getNodeInjectable(lView, tView, index, tNode, flags) {
  let value = lView[index];
  const tData = tView.data;
  if (value instanceof NodeInjectorFactory) {
    const factory = value;
    ngDevMode && injectionPath.push(factory.name ?? "unknown");
    if (factory.resolving) {
      let token2 = "";
      if (ngDevMode) {
        token2 = stringifyForError(tData[index]);
        throw cyclicDependencyErrorWithDetails(token2, injectionPath);
      } else {
        throw cyclicDependencyError(token2);
      }
    }
    const previousIncludeViewProviders = setIncludeViewProviders(factory.canSeeViewProviders);
    factory.resolving = true;
    const token = tData[index].type || tData[index];
    let prevInjectContext;
    if (ngDevMode) {
      const injector = new NodeInjector(tNode, lView);
      prevInjectContext = setInjectorProfilerContext({
        injector,
        token
      });
    }
    const previousInjectImplementation = factory.injectImpl ? setInjectImplementation(factory.injectImpl) : null;
    const success = enterDI(lView, tNode, 0);
    ngDevMode && assertEqual(success, true, "Because flags do not contain `SkipSelf' we expect this to always succeed.");
    try {
      ngDevMode && emitInjectorToCreateInstanceEvent(token);
      value = lView[index] = factory.factory(void 0, flags, tData, lView, tNode);
      ngDevMode && emitInstanceCreatedByInjectorEvent(value);
      if (tView.firstCreatePass && index >= tNode.directiveStart) {
        ngDevMode && assertDirectiveDef(tData[index]);
        registerPreOrderHooks(index, tData[index], tView);
      }
    } finally {
      ngDevMode && setInjectorProfilerContext(prevInjectContext);
      previousInjectImplementation !== null && setInjectImplementation(previousInjectImplementation);
      setIncludeViewProviders(previousIncludeViewProviders);
      factory.resolving = false;
      leaveDI();
      ngDevMode && (injectionPath = []);
    }
  }
  return value;
}
function bloomHashBitOrFactory(token) {
  ngDevMode && assertDefined(token, "token must be defined");
  if (typeof token === "string") {
    return token.charCodeAt(0) || 0;
  }
  const tokenId = token.hasOwnProperty(NG_ELEMENT_ID) ? token[NG_ELEMENT_ID] : void 0;
  if (typeof tokenId === "number") {
    if (tokenId >= 0) {
      return tokenId & BLOOM_MASK;
    } else {
      ngDevMode && assertEqual(tokenId, -1, "Expecting to get Special Injector Id");
      return createNodeInjector;
    }
  } else {
    return tokenId;
  }
}
function bloomHasToken(bloomHash, injectorIndex, injectorView) {
  const mask = 1 << bloomHash;
  const value = injectorView[injectorIndex + (bloomHash >> BLOOM_BUCKET_BITS)];
  return !!(value & mask);
}
function shouldSearchParent(flags, isFirstHostTNode) {
  return !(flags & 2) && !(flags & 1 && isFirstHostTNode);
}
function getNodeInjectorLView(nodeInjector) {
  return nodeInjector._lView;
}
function getNodeInjectorTNode(nodeInjector) {
  return nodeInjector._tNode;
}
var NodeInjector = class {
  _tNode;
  _lView;
  constructor(_tNode, _lView) {
    this._tNode = _tNode;
    this._lView = _lView;
  }
  get(token, notFoundValue, flags) {
    return getOrCreateInjectable(this._tNode, this._lView, token, convertToBitFlags(flags), notFoundValue);
  }
};
function createNodeInjector() {
  return new NodeInjector(getCurrentTNode(), getLView());
}
function ɵɵgetInheritedFactory(type) {
  return noSideEffects(() => {
    const ownConstructor = type.prototype.constructor;
    const ownFactory = ownConstructor[NG_FACTORY_DEF] || getFactoryOf(ownConstructor);
    const objectPrototype = Object.prototype;
    let parent = Object.getPrototypeOf(type.prototype).constructor;
    while (parent && parent !== objectPrototype) {
      const factory = parent[NG_FACTORY_DEF] || getFactoryOf(parent);
      if (factory && factory !== ownFactory) {
        return factory;
      }
      parent = Object.getPrototypeOf(parent);
    }
    return (t) => new t();
  });
}
function getFactoryOf(type) {
  if (isForwardRef(type)) {
    return () => {
      const factory = getFactoryOf(resolveForwardRef(type));
      return factory && factory();
    };
  }
  return getFactoryDef(type);
}
function lookupTokenUsingEmbeddedInjector(tNode, lView, token, flags, notFoundValue) {
  let currentTNode = tNode;
  let currentLView = lView;
  while (currentTNode !== null && currentLView !== null && currentLView[FLAGS] & 2048 && !isRootView(currentLView)) {
    ngDevMode && assertTNodeForLView(currentTNode, currentLView);
    const nodeInjectorValue = lookupTokenUsingNodeInjector(currentTNode, currentLView, token, flags | 2, NOT_FOUND);
    if (nodeInjectorValue !== NOT_FOUND) {
      return nodeInjectorValue;
    }
    let parentTNode = currentTNode.parent;
    if (!parentTNode) {
      const embeddedViewInjector = currentLView[EMBEDDED_VIEW_INJECTOR];
      if (embeddedViewInjector) {
        const embeddedViewInjectorValue = embeddedViewInjector.get(token, NOT_FOUND, flags);
        if (embeddedViewInjectorValue !== NOT_FOUND) {
          return embeddedViewInjectorValue;
        }
      }
      parentTNode = getTNodeFromLView(currentLView);
      currentLView = currentLView[DECLARATION_VIEW];
    }
    currentTNode = parentTNode;
  }
  return notFoundValue;
}
function getTNodeFromLView(lView) {
  const tView = lView[TVIEW];
  const tViewType = tView.type;
  if (tViewType === 2) {
    ngDevMode && assertDefined(tView.declTNode, "Embedded TNodes should have declaration parents.");
    return tView.declTNode;
  } else if (tViewType === 1) {
    return lView[T_HOST];
  }
  return null;
}
function ɵɵinjectAttribute(attrNameToInject) {
  return injectAttributeImpl(getCurrentTNode(), attrNameToInject);
}
var Attribute2 = makeParamDecorator("Attribute", (attributeName2) => ({
  attributeName: attributeName2,
  __NG_ELEMENT_ID__: () => ɵɵinjectAttribute(attributeName2)
}));
var _reflect = null;
function getReflect() {
  return _reflect = _reflect || new ReflectionCapabilities();
}
function reflectDependencies(type) {
  return convertDependencies(getReflect().parameters(type));
}
function convertDependencies(deps) {
  return deps.map((dep) => reflectDependency(dep));
}
function reflectDependency(dep) {
  const meta = {
    token: null,
    attribute: null,
    host: false,
    optional: false,
    self: false,
    skipSelf: false
  };
  if (Array.isArray(dep) && dep.length > 0) {
    for (let j = 0; j < dep.length; j++) {
      const param = dep[j];
      if (param === void 0) {
        continue;
      }
      const proto = Object.getPrototypeOf(param);
      if (param instanceof Optional || proto.ngMetadataName === "Optional") {
        meta.optional = true;
      } else if (param instanceof SkipSelf || proto.ngMetadataName === "SkipSelf") {
        meta.skipSelf = true;
      } else if (param instanceof Self || proto.ngMetadataName === "Self") {
        meta.self = true;
      } else if (param instanceof Host || proto.ngMetadataName === "Host") {
        meta.host = true;
      } else if (param instanceof Inject) {
        meta.token = param.token;
      } else if (param instanceof Attribute2) {
        if (param.attributeName === void 0) {
          throw new RuntimeError(204, ngDevMode && `Attribute name must be defined.`);
        }
        meta.attribute = param.attributeName;
      } else {
        meta.token = param;
      }
    }
  } else if (dep === void 0 || Array.isArray(dep) && dep.length === 0) {
    meta.token = null;
  } else {
    meta.token = dep;
  }
  return meta;
}
function compileInjectable(type, meta) {
  let ngInjectableDef = null;
  let ngFactoryDef = null;
  if (!type.hasOwnProperty(NG_PROV_DEF)) {
    Object.defineProperty(type, NG_PROV_DEF, {
      get: () => {
        if (ngInjectableDef === null) {
          const compiler = getCompilerFacade({
            usage: 0,
            kind: "injectable",
            type
          });
          ngInjectableDef = compiler.compileInjectable(angularCoreDiEnv, `ng:///${type.name}/ɵprov.js`, getInjectableMetadata(type, meta));
        }
        return ngInjectableDef;
      }
    });
  }
  if (!type.hasOwnProperty(NG_FACTORY_DEF)) {
    Object.defineProperty(type, NG_FACTORY_DEF, {
      get: () => {
        if (ngFactoryDef === null) {
          const compiler = getCompilerFacade({
            usage: 0,
            kind: "injectable",
            type
          });
          ngFactoryDef = compiler.compileFactory(angularCoreDiEnv, `ng:///${type.name}/ɵfac.js`, {
            name: type.name,
            type,
            typeArgumentCount: 0,
            deps: reflectDependencies(type),
            target: compiler.FactoryTarget.Injectable
          });
        }
        return ngFactoryDef;
      },
      configurable: true
    });
  }
}
var USE_VALUE = getClosureSafeProperty({
  provide: String,
  useValue: getClosureSafeProperty
});
function isUseClassProvider(meta) {
  return meta.useClass !== void 0;
}
function isUseValueProvider(meta) {
  return USE_VALUE in meta;
}
function isUseFactoryProvider(meta) {
  return meta.useFactory !== void 0;
}
function isUseExistingProvider(meta) {
  return meta.useExisting !== void 0;
}
function getInjectableMetadata(type, srcMeta) {
  const meta = srcMeta || {
    providedIn: null
  };
  const compilerMeta = {
    name: type.name,
    type,
    typeArgumentCount: 0,
    providedIn: meta.providedIn
  };
  if ((isUseClassProvider(meta) || isUseFactoryProvider(meta)) && meta.deps !== void 0) {
    compilerMeta.deps = convertDependencies(meta.deps);
  }
  if (isUseClassProvider(meta)) {
    compilerMeta.useClass = meta.useClass;
  } else if (isUseValueProvider(meta)) {
    compilerMeta.useValue = meta.useValue;
  } else if (isUseFactoryProvider(meta)) {
    compilerMeta.useFactory = meta.useFactory;
  } else if (isUseExistingProvider(meta)) {
    compilerMeta.useExisting = meta.useExisting;
  }
  return compilerMeta;
}
var Injectable = makeDecorator("Injectable", void 0, void 0, void 0, (type, meta) => compileInjectable(type, meta));
function injectElementRef() {
  return createElementRef(getCurrentTNode(), getLView());
}
function createElementRef(tNode, lView) {
  return new ElementRef(getNativeByTNode(tNode, lView));
}
var ElementRef = class {
  nativeElement;
  constructor(nativeElement) {
    this.nativeElement = nativeElement;
  }
  static __NG_ELEMENT_ID__ = injectElementRef;
};
function unwrapElementRef(value) {
  return value instanceof ElementRef ? value.nativeElement : value;
}
function symbolIterator() {
  return this._results[Symbol.iterator]();
}
var QueryList = class {
  _emitDistinctChangesOnly;
  dirty = true;
  _onDirty = void 0;
  _results = [];
  _changesDetected = false;
  _changes = void 0;
  length = 0;
  first = void 0;
  last = void 0;
  get changes() {
    return this._changes ??= new Subject();
  }
  constructor(_emitDistinctChangesOnly = false) {
    this._emitDistinctChangesOnly = _emitDistinctChangesOnly;
  }
  get(index) {
    return this._results[index];
  }
  map(fn) {
    return this._results.map(fn);
  }
  filter(fn) {
    return this._results.filter(fn);
  }
  find(fn) {
    return this._results.find(fn);
  }
  reduce(fn, init) {
    return this._results.reduce(fn, init);
  }
  forEach(fn) {
    this._results.forEach(fn);
  }
  some(fn) {
    return this._results.some(fn);
  }
  toArray() {
    return this._results.slice();
  }
  toString() {
    return this._results.toString();
  }
  reset(resultsTree, identityAccessor) {
    this.dirty = false;
    const newResultFlat = flatten(resultsTree);
    if (this._changesDetected = !arrayEquals(this._results, newResultFlat, identityAccessor)) {
      this._results = newResultFlat;
      this.length = newResultFlat.length;
      this.last = newResultFlat[this.length - 1];
      this.first = newResultFlat[0];
    }
  }
  notifyOnChanges() {
    if (this._changes !== void 0 && (this._changesDetected || !this._emitDistinctChangesOnly)) this._changes.next(this);
  }
  onDirty(cb) {
    this._onDirty = cb;
  }
  setDirty() {
    this.dirty = true;
    this._onDirty?.();
  }
  destroy() {
    if (this._changes !== void 0) {
      this._changes.complete();
      this._changes.unsubscribe();
    }
  }
  [Symbol.iterator] = /* @__PURE__ */ (() => symbolIterator)();
};
var SKIP_HYDRATION_ATTR_NAME = "ngSkipHydration";
var SKIP_HYDRATION_ATTR_NAME_LOWER_CASE = "ngskiphydration";
function hasSkipHydrationAttrOnTNode(tNode) {
  const attrs = tNode.mergedAttrs;
  if (attrs === null) return false;
  for (let i = 0; i < attrs.length; i += 2) {
    const value = attrs[i];
    if (typeof value === "number") return false;
    if (typeof value === "string" && value.toLowerCase() === SKIP_HYDRATION_ATTR_NAME_LOWER_CASE) {
      return true;
    }
  }
  return false;
}
function hasSkipHydrationAttrOnRElement(rNode) {
  return rNode.hasAttribute(SKIP_HYDRATION_ATTR_NAME);
}
function hasInSkipHydrationBlockFlag(tNode) {
  return (tNode.flags & 128) === 128;
}
function isInSkipHydrationBlock2(tNode) {
  if (hasInSkipHydrationBlockFlag(tNode)) {
    return true;
  }
  let currentTNode = tNode.parent;
  while (currentTNode) {
    if (hasInSkipHydrationBlockFlag(tNode) || hasSkipHydrationAttrOnTNode(currentTNode)) {
      return true;
    }
    currentTNode = currentTNode.parent;
  }
  return false;
}
function isI18nInSkipHydrationBlock(parentTNode) {
  return hasInSkipHydrationBlockFlag(parentTNode) || hasSkipHydrationAttrOnTNode(parentTNode) || isInSkipHydrationBlock2(parentTNode);
}
var ChangeDetectionStrategy;
(function(ChangeDetectionStrategy2) {
  ChangeDetectionStrategy2[ChangeDetectionStrategy2["OnPush"] = 0] = "OnPush";
  ChangeDetectionStrategy2[ChangeDetectionStrategy2["Default"] = 1] = "Default";
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
var TRACKED_LVIEWS = /* @__PURE__ */ new Map();
var uniqueIdCounter = 0;
function getUniqueLViewId() {
  return uniqueIdCounter++;
}
function registerLView(lView) {
  ngDevMode && assertNumber(lView[ID], "LView must have an ID in order to be registered");
  TRACKED_LVIEWS.set(lView[ID], lView);
}
function getLViewById(id) {
  ngDevMode && assertNumber(id, "ID used for LView lookup must be a number");
  return TRACKED_LVIEWS.get(id) || null;
}
function unregisterLView(lView) {
  ngDevMode && assertNumber(lView[ID], "Cannot stop tracking an LView that does not have an ID");
  TRACKED_LVIEWS.delete(lView[ID]);
}
function getTrackedLViews() {
  return TRACKED_LVIEWS;
}
var LContext = class {
  lViewId;
  nodeIndex;
  native;
  component;
  directives;
  localRefs;
  get lView() {
    return getLViewById(this.lViewId);
  }
  constructor(lViewId, nodeIndex, native) {
    this.lViewId = lViewId;
    this.nodeIndex = nodeIndex;
    this.native = native;
  }
};
function getLContext(target) {
  let mpValue = readPatchedData(target);
  if (mpValue) {
    if (isLView(mpValue)) {
      const lView = mpValue;
      let nodeIndex;
      let component = void 0;
      let directives = void 0;
      if (isComponentInstance(target)) {
        nodeIndex = findViaComponent(lView, target);
        if (nodeIndex == -1) {
          throw new Error("The provided component was not found in the application");
        }
        component = target;
      } else if (isDirectiveInstance(target)) {
        nodeIndex = findViaDirective(lView, target);
        if (nodeIndex == -1) {
          throw new Error("The provided directive was not found in the application");
        }
        directives = getDirectivesAtNodeIndex(nodeIndex, lView);
      } else {
        nodeIndex = findViaNativeElement(lView, target);
        if (nodeIndex == -1) {
          return null;
        }
      }
      const native = unwrapRNode(lView[nodeIndex]);
      const existingCtx = readPatchedData(native);
      const context = existingCtx && !Array.isArray(existingCtx) ? existingCtx : createLContext(lView, nodeIndex, native);
      if (component && context.component === void 0) {
        context.component = component;
        attachPatchData(context.component, context);
      }
      if (directives && context.directives === void 0) {
        context.directives = directives;
        for (let i = 0; i < directives.length; i++) {
          attachPatchData(directives[i], context);
        }
      }
      attachPatchData(context.native, context);
      mpValue = context;
    }
  } else {
    const rElement = target;
    ngDevMode && assertDomNode(rElement);
    let parent = rElement;
    while (parent = parent.parentNode) {
      const parentContext = readPatchedData(parent);
      if (parentContext) {
        const lView = Array.isArray(parentContext) ? parentContext : parentContext.lView;
        if (!lView) {
          return null;
        }
        const index = findViaNativeElement(lView, rElement);
        if (index >= 0) {
          const native = unwrapRNode(lView[index]);
          const context = createLContext(lView, index, native);
          attachPatchData(native, context);
          mpValue = context;
          break;
        }
      }
    }
  }
  return mpValue || null;
}
function createLContext(lView, nodeIndex, native) {
  return new LContext(lView[ID], nodeIndex, native);
}
function getComponentViewByInstance(componentInstance) {
  let patchedData = readPatchedData(componentInstance);
  let lView;
  if (isLView(patchedData)) {
    const contextLView = patchedData;
    const nodeIndex = findViaComponent(contextLView, componentInstance);
    lView = getComponentLViewByIndex(nodeIndex, contextLView);
    const context = createLContext(contextLView, nodeIndex, lView[HOST]);
    context.component = componentInstance;
    attachPatchData(componentInstance, context);
    attachPatchData(context.native, context);
  } else {
    const context = patchedData;
    const contextLView = context.lView;
    ngDevMode && assertLView(contextLView);
    lView = getComponentLViewByIndex(context.nodeIndex, contextLView);
  }
  return lView;
}
var MONKEY_PATCH_KEY_NAME = "__ngContext__";
function attachPatchData(target, data) {
  ngDevMode && assertDefined(target, "Target expected");
  if (isLView(data)) {
    target[MONKEY_PATCH_KEY_NAME] = data[ID];
    registerLView(data);
  } else {
    target[MONKEY_PATCH_KEY_NAME] = data;
  }
}
function readPatchedData(target) {
  ngDevMode && assertDefined(target, "Target expected");
  const data = target[MONKEY_PATCH_KEY_NAME];
  return typeof data === "number" ? getLViewById(data) : data || null;
}
function readPatchedLView(target) {
  const value = readPatchedData(target);
  if (value) {
    return isLView(value) ? value : value.lView;
  }
  return null;
}
function isComponentInstance(instance) {
  return instance && instance.constructor && instance.constructor.ɵcmp;
}
function isDirectiveInstance(instance) {
  return instance && instance.constructor && instance.constructor.ɵdir;
}
function findViaNativeElement(lView, target) {
  const tView = lView[TVIEW];
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    if (unwrapRNode(lView[i]) === target) {
      return i;
    }
  }
  return -1;
}
function traverseNextElement(tNode) {
  if (tNode.child) {
    return tNode.child;
  } else if (tNode.next) {
    return tNode.next;
  } else {
    while (tNode.parent && !tNode.parent.next) {
      tNode = tNode.parent;
    }
    return tNode.parent && tNode.parent.next;
  }
}
function findViaComponent(lView, componentInstance) {
  const componentIndices = lView[TVIEW].components;
  if (componentIndices) {
    for (let i = 0; i < componentIndices.length; i++) {
      const elementComponentIndex = componentIndices[i];
      const componentView = getComponentLViewByIndex(elementComponentIndex, lView);
      if (componentView[CONTEXT] === componentInstance) {
        return elementComponentIndex;
      }
    }
  } else {
    const rootComponentView = getComponentLViewByIndex(HEADER_OFFSET, lView);
    const rootComponent = rootComponentView[CONTEXT];
    if (rootComponent === componentInstance) {
      return HEADER_OFFSET;
    }
  }
  return -1;
}
function findViaDirective(lView, directiveInstance) {
  let tNode = lView[TVIEW].firstChild;
  while (tNode) {
    const directiveIndexStart = tNode.directiveStart;
    const directiveIndexEnd = tNode.directiveEnd;
    for (let i = directiveIndexStart; i < directiveIndexEnd; i++) {
      if (lView[i] === directiveInstance) {
        return tNode.index;
      }
    }
    tNode = traverseNextElement(tNode);
  }
  return -1;
}
function getDirectivesAtNodeIndex(nodeIndex, lView) {
  const tNode = lView[TVIEW].data[nodeIndex];
  if (tNode.directiveStart === 0) return EMPTY_ARRAY;
  const results = [];
  for (let i = tNode.directiveStart; i < tNode.directiveEnd; i++) {
    const directiveInstance = lView[i];
    if (!isComponentInstance(directiveInstance)) {
      results.push(directiveInstance);
    }
  }
  return results;
}
function getComponentAtNodeIndex(nodeIndex, lView) {
  const tNode = lView[TVIEW].data[nodeIndex];
  return isComponentHost(tNode) ? lView[tNode.directiveStart + tNode.componentOffset] : null;
}
function discoverLocalRefs(lView, nodeIndex) {
  const tNode = lView[TVIEW].data[nodeIndex];
  if (tNode && tNode.localNames) {
    const result = {};
    let localIndex = tNode.index + 1;
    for (let i = 0; i < tNode.localNames.length; i += 2) {
      result[tNode.localNames[i]] = lView[localIndex];
      localIndex++;
    }
    return result;
  }
  return null;
}
function getRootView(componentOrLView) {
  ngDevMode && assertDefined(componentOrLView, "component");
  let lView = isLView(componentOrLView) ? componentOrLView : readPatchedLView(componentOrLView);
  while (lView && !isRootView(lView)) {
    lView = getLViewParent(lView);
  }
  ngDevMode && assertLView(lView);
  return lView;
}
function getRootContext(viewOrComponent) {
  const rootView = getRootView(viewOrComponent);
  ngDevMode && assertDefined(rootView[CONTEXT], "Root view has no context. Perhaps it is disconnected?");
  return rootView[CONTEXT];
}
function getFirstLContainer(lView) {
  return getNearestLContainer(lView[CHILD_HEAD]);
}
function getNextLContainer(container) {
  return getNearestLContainer(container[NEXT]);
}
function getNearestLContainer(viewOrContainer) {
  while (viewOrContainer !== null && !isLContainer(viewOrContainer)) {
    viewOrContainer = viewOrContainer[NEXT];
  }
  return viewOrContainer;
}
function getComponent(element) {
  ngDevMode && assertDomElement(element);
  const context = getLContext(element);
  if (context === null) return null;
  if (context.component === void 0) {
    const lView = context.lView;
    if (lView === null) {
      return null;
    }
    context.component = getComponentAtNodeIndex(context.nodeIndex, lView);
  }
  return context.component;
}
function getContext(element) {
  assertDomElement(element);
  const context = getLContext(element);
  const lView = context ? context.lView : null;
  return lView === null ? null : lView[CONTEXT];
}
function getOwningComponent(elementOrDir) {
  const context = getLContext(elementOrDir);
  let lView = context ? context.lView : null;
  if (lView === null) return null;
  let parent;
  while (lView[TVIEW].type === 2 && (parent = getLViewParent(lView))) {
    lView = parent;
  }
  return isRootView(lView) ? null : lView[CONTEXT];
}
function getRootComponents(elementOrDir) {
  const lView = readPatchedLView(elementOrDir);
  return lView !== null ? [getRootContext(lView)] : [];
}
function getInjector(elementOrDir) {
  const context = getLContext(elementOrDir);
  const lView = context ? context.lView : null;
  if (lView === null) return Injector.NULL;
  const tNode = lView[TVIEW].data[context.nodeIndex];
  return new NodeInjector(tNode, lView);
}
function getInjectionTokens(element) {
  const context = getLContext(element);
  const lView = context ? context.lView : null;
  if (lView === null) return [];
  const tView = lView[TVIEW];
  const tNode = tView.data[context.nodeIndex];
  const providerTokens = [];
  const startIndex = tNode.providerIndexes & 1048575;
  const endIndex = tNode.directiveEnd;
  for (let i = startIndex; i < endIndex; i++) {
    let value = tView.data[i];
    if (isDirectiveDefHack(value)) {
      value = value.type;
    }
    providerTokens.push(value);
  }
  return providerTokens;
}
function getDirectives(node) {
  if (node instanceof Text) {
    return [];
  }
  const context = getLContext(node);
  const lView = context ? context.lView : null;
  if (lView === null) {
    return [];
  }
  const tView = lView[TVIEW];
  const nodeIndex = context.nodeIndex;
  if (!tView?.data[nodeIndex]) {
    return [];
  }
  if (context.directives === void 0) {
    context.directives = getDirectivesAtNodeIndex(nodeIndex, lView);
  }
  return context.directives === null ? [] : [...context.directives];
}
var AcxChangeDetectionStrategy;
(function(AcxChangeDetectionStrategy2) {
  AcxChangeDetectionStrategy2[AcxChangeDetectionStrategy2["Default"] = 0] = "Default";
  AcxChangeDetectionStrategy2[AcxChangeDetectionStrategy2["OnPush"] = 1] = "OnPush";
})(AcxChangeDetectionStrategy || (AcxChangeDetectionStrategy = {}));
var AcxViewEncapsulation;
(function(AcxViewEncapsulation2) {
  AcxViewEncapsulation2[AcxViewEncapsulation2["Emulated"] = 0] = "Emulated";
  AcxViewEncapsulation2[AcxViewEncapsulation2["None"] = 1] = "None";
})(AcxViewEncapsulation || (AcxViewEncapsulation = {}));
function getDirectiveMetadata$1(directiveOrComponentInstance) {
  const {
    constructor
  } = directiveOrComponentInstance;
  if (!constructor) {
    throw new Error("Unable to find the instance constructor");
  }
  const componentDef = getComponentDef(constructor);
  if (componentDef) {
    const inputs = extractInputDebugMetadata(componentDef.inputs);
    return {
      inputs,
      outputs: componentDef.outputs,
      encapsulation: componentDef.encapsulation,
      changeDetection: componentDef.onPush ? ChangeDetectionStrategy.OnPush : ChangeDetectionStrategy.Default
    };
  }
  const directiveDef = getDirectiveDef(constructor);
  if (directiveDef) {
    const inputs = extractInputDebugMetadata(directiveDef.inputs);
    return {
      inputs,
      outputs: directiveDef.outputs
    };
  }
  return null;
}
function getLocalRefs(target) {
  const context = getLContext(target);
  if (context === null) return {};
  if (context.localRefs === void 0) {
    const lView = context.lView;
    if (lView === null) {
      return {};
    }
    context.localRefs = discoverLocalRefs(lView, context.nodeIndex);
  }
  return context.localRefs || {};
}
function getHostElement(componentOrDirective) {
  return getLContext(componentOrDirective).native;
}
function getListeners(element) {
  ngDevMode && assertDomElement(element);
  const lContext = getLContext(element);
  const lView = lContext === null ? null : lContext.lView;
  if (lView === null) return [];
  const tView = lView[TVIEW];
  const lCleanup = lView[CLEANUP];
  const tCleanup = tView.cleanup;
  const listeners = [];
  if (tCleanup && lCleanup) {
    for (let i = 0; i < tCleanup.length; ) {
      const firstParam = tCleanup[i++];
      const secondParam = tCleanup[i++];
      if (typeof firstParam === "string") {
        const name = firstParam;
        const listenerElement = unwrapRNode(lView[secondParam]);
        const callback = lCleanup[tCleanup[i++]];
        const useCaptureOrIndx = tCleanup[i++];
        const type = typeof useCaptureOrIndx === "boolean" || useCaptureOrIndx >= 0 ? "dom" : "output";
        const useCapture = typeof useCaptureOrIndx === "boolean" ? useCaptureOrIndx : false;
        if (element == listenerElement) {
          listeners.push({
            element,
            name,
            callback,
            useCapture,
            type
          });
        }
      }
    }
  }
  listeners.sort(sortListeners);
  return listeners;
}
function sortListeners(a, b) {
  if (a.name == b.name) return 0;
  return a.name < b.name ? -1 : 1;
}
function isDirectiveDefHack(obj) {
  return obj.type !== void 0 && obj.declaredInputs !== void 0 && obj.resolveHostDirectives !== void 0;
}
function assertDomElement(value) {
  if (typeof Element !== "undefined" && !(value instanceof Element)) {
    throw new Error("Expecting instance of DOM Element");
  }
}
function extractInputDebugMetadata(inputs) {
  const res = {};
  for (const key in inputs) {
    if (inputs.hasOwnProperty(key)) {
      const value = inputs[key];
      if (value !== void 0) {
        res[key] = value[0];
      }
    }
  }
  return res;
}
var DOCUMENT2 = void 0;
function setDocument(document2) {
  DOCUMENT2 = document2;
}
function getDocument() {
  if (DOCUMENT2 !== void 0) {
    return DOCUMENT2;
  } else if (typeof document !== "undefined") {
    return document;
  }
  throw new RuntimeError(210, (typeof ngDevMode === "undefined" || ngDevMode) && `The document object is not available in this context. Make sure the DOCUMENT injection token is provided.`);
}
var APP_ID = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "AppId" : "", {
  factory: () => DEFAULT_APP_ID
});
var DEFAULT_APP_ID = "ng";
var validAppIdInitializer = {
  provide: ENVIRONMENT_INITIALIZER,
  multi: true,
  useValue: () => {
    const appId = inject(APP_ID);
    const isAlphanumeric = /^[a-zA-Z0-9\-_]+$/.test(appId);
    if (!isAlphanumeric) {
      throw new RuntimeError(211, `APP_ID value "${appId}" is not alphanumeric. The APP_ID must be a string of alphanumeric characters. (a-zA-Z0-9), hyphens (-) and underscores (_) are allowed.`);
    }
  }
};
var PLATFORM_INITIALIZER = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "Platform Initializer" : "");
var PLATFORM_ID = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "Platform ID" : "", {
  providedIn: "platform",
  factory: () => "unknown"
});
var ANIMATION_MODULE_TYPE = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "AnimationModuleType" : "");
var CSP_NONCE = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "CSP nonce" : "", {
  factory: () => {
    return inject(DOCUMENT).body?.querySelector("[ngCspNonce]")?.getAttribute("ngCspNonce") || null;
  }
});
var IMAGE_CONFIG_DEFAULTS = {
  breakpoints: [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  placeholderResolution: 30,
  disableImageSizeWarning: false,
  disableImageLazyLoadWarning: false
};
var IMAGE_CONFIG = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "ImageConfig" : "", {
  factory: () => IMAGE_CONFIG_DEFAULTS
});
function makeStateKey(key) {
  return key;
}
var TransferState = class _TransferState {
  static ɵprov = ɵɵdefineInjectable({
    token: _TransferState,
    providedIn: "root",
    factory: () => {
      const transferState = new _TransferState();
      if (true) {
        transferState.store = retrieveTransferredState(inject(DOCUMENT), inject(APP_ID));
      }
      return transferState;
    }
  });
  store = {};
  onSerializeCallbacks = {};
  get(key, defaultValue) {
    return this.store[key] !== void 0 ? this.store[key] : defaultValue;
  }
  set(key, value) {
    this.store[key] = value;
  }
  remove(key) {
    delete this.store[key];
  }
  hasKey(key) {
    return this.store.hasOwnProperty(key);
  }
  get isEmpty() {
    return Object.keys(this.store).length === 0;
  }
  onSerialize(key, callback) {
    this.onSerializeCallbacks[key] = callback;
  }
  toJson() {
    for (const key in this.onSerializeCallbacks) {
      if (this.onSerializeCallbacks.hasOwnProperty(key)) {
        try {
          this.store[key] = this.onSerializeCallbacks[key]();
        } catch (e) {
          console.warn("Exception in onSerialize callback: ", e);
        }
      }
    }
    return JSON.stringify(this.store).replace(/</g, "\\u003C");
  }
};
function retrieveTransferredState(doc, appId) {
  const script = doc.getElementById(appId + "-state");
  if (script?.textContent) {
    try {
      return JSON.parse(script.textContent);
    } catch (e) {
      console.warn("Exception while restoring TransferState for app " + appId, e);
    }
  }
  return {};
}
var REFERENCE_NODE_HOST = "h";
var REFERENCE_NODE_BODY = "b";
var NODE_NAVIGATION_STEP_FIRST_CHILD = "f";
var NODE_NAVIGATION_STEP_NEXT_SIBLING = "n";
var ELEMENT_CONTAINERS = "e";
var TEMPLATES = "t";
var CONTAINERS = "c";
var MULTIPLIER = "x";
var NUM_ROOT_NODES = "r";
var TEMPLATE_ID = "i";
var NODES = "n";
var DISCONNECTED_NODES = "d";
var I18N_DATA = "l";
var DEFER_BLOCK_ID = "di";
var DEFER_BLOCK_STATE$1 = "s";
var DEFER_PARENT_BLOCK_ID = "p";
var DEFER_HYDRATE_TRIGGERS = "t";
var IS_HYDRATION_DOM_REUSE_ENABLED = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "IS_HYDRATION_DOM_REUSE_ENABLED" : "");
var PRESERVE_HOST_CONTENT_DEFAULT = false;
var PRESERVE_HOST_CONTENT = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "PRESERVE_HOST_CONTENT" : "", {
  factory: () => PRESERVE_HOST_CONTENT_DEFAULT
});
var IS_I18N_HYDRATION_ENABLED = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "IS_I18N_HYDRATION_ENABLED" : "");
var IS_EVENT_REPLAY_ENABLED = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "IS_EVENT_REPLAY_ENABLED" : "");
var EVENT_REPLAY_ENABLED_DEFAULT = false;
var EVENT_REPLAY_QUEUE = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "EVENT_REPLAY_QUEUE" : "", {
  factory: () => []
});
var IS_INCREMENTAL_HYDRATION_ENABLED = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "IS_INCREMENTAL_HYDRATION_ENABLED" : "");
var JSACTION_BLOCK_ELEMENT_MAP = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "JSACTION_BLOCK_ELEMENT_MAP" : "", {
  factory: () => /* @__PURE__ */ new Map()
});
var IS_ENABLED_BLOCKING_INITIAL_NAVIGATION = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "IS_ENABLED_BLOCKING_INITIAL_NAVIGATION" : "");
var eventListenerOptions = {
  passive: true,
  capture: true
};
var hoverTriggers = /* @__PURE__ */ new WeakMap();
var interactionTriggers = /* @__PURE__ */ new WeakMap();
var viewportTriggers = /* @__PURE__ */ new WeakMap();
var interactionEventNames = ["click", "keydown"];
var hoverEventNames = ["mouseenter", "mouseover", "focusin"];
var intersectionObservers = /* @__PURE__ */ new Map();
var DeferEventEntry = class {
  callbacks = /* @__PURE__ */ new Set();
  listener = () => {
    for (const callback of this.callbacks) {
      callback();
    }
  };
};
function onInteraction(trigger, callback) {
  let entry = interactionTriggers.get(trigger);
  if (!entry) {
    entry = new DeferEventEntry();
    interactionTriggers.set(trigger, entry);
    for (const name of interactionEventNames) {
      trigger.addEventListener(name, entry.listener, eventListenerOptions);
    }
  }
  entry.callbacks.add(callback);
  return () => {
    const {
      callbacks,
      listener
    } = entry;
    callbacks.delete(callback);
    if (callbacks.size === 0) {
      interactionTriggers.delete(trigger);
      for (const name of interactionEventNames) {
        trigger.removeEventListener(name, listener, eventListenerOptions);
      }
    }
  };
}
function onHover(trigger, callback) {
  let entry = hoverTriggers.get(trigger);
  if (!entry) {
    entry = new DeferEventEntry();
    hoverTriggers.set(trigger, entry);
    for (const name of hoverEventNames) {
      trigger.addEventListener(name, entry.listener, eventListenerOptions);
    }
  }
  entry.callbacks.add(callback);
  return () => {
    const {
      callbacks,
      listener
    } = entry;
    callbacks.delete(callback);
    if (callbacks.size === 0) {
      for (const name of hoverEventNames) {
        trigger.removeEventListener(name, listener, eventListenerOptions);
      }
      hoverTriggers.delete(trigger);
    }
  };
}
function createIntersectionObserver(options) {
  const key = getIntersectionObserverKey(options);
  return new IntersectionObserver((entries) => {
    for (const current of entries) {
      if (current.isIntersecting && viewportTriggers.has(current.target)) {
        viewportTriggers.get(current.target)?.get(key)?.listener();
      }
    }
  }, options);
}
function onViewport(trigger, callback, observerFactoryFn, options) {
  const key = getIntersectionObserverKey(options);
  let entry = viewportTriggers.get(trigger)?.get(key);
  if (!intersectionObservers.has(key)) {
    intersectionObservers.set(key, {
      observer: observerFactoryFn(options),
      count: 0
    });
  }
  const config = intersectionObservers.get(key);
  if (!entry) {
    entry = new DeferEventEntry();
    config.observer.observe(trigger);
    let triggerConfig = viewportTriggers.get(trigger);
    if (triggerConfig) {
      triggerConfig.set(key, entry);
    } else {
      triggerConfig = /* @__PURE__ */ new Map();
      viewportTriggers.set(trigger, triggerConfig);
    }
    triggerConfig.set(key, entry);
    config.count++;
  }
  entry.callbacks.add(callback);
  return () => {
    if (!viewportTriggers.get(trigger)?.has(key)) {
      return;
    }
    entry.callbacks.delete(callback);
    if (entry.callbacks.size === 0) {
      config.observer.unobserve(trigger);
      config.count--;
      const triggerConfig = viewportTriggers.get(trigger);
      if (triggerConfig) {
        triggerConfig.delete(key);
        if (triggerConfig.size === 0) {
          viewportTriggers.delete(trigger);
        }
      }
    }
    if (config.count === 0) {
      config.observer.disconnect();
      intersectionObservers.delete(key);
    }
  };
}
function getIntersectionObserverKey(options) {
  if (!options) {
    return "";
  }
  return `${options.rootMargin}/${typeof options.threshold === "number" ? options.threshold : options.threshold?.join("\n")}`;
}
var DEFER_BLOCK_SSR_ID_ATTRIBUTE = "ngb";
function setJSActionAttributes(nativeElement, eventTypes, parentDeferBlockId = null) {
  if (eventTypes.length === 0 || nativeElement.nodeType !== Node.ELEMENT_NODE) {
    return;
  }
  const existingAttr = nativeElement.getAttribute(Attribute.JSACTION);
  const parts = eventTypes.reduce((prev, curr) => {
    return (existingAttr?.indexOf(curr) ?? -1) === -1 ? prev + curr + ":;" : prev;
  }, "");
  nativeElement.setAttribute(Attribute.JSACTION, `${existingAttr ?? ""}${parts}`);
  const blockName = parentDeferBlockId ?? "";
  if (blockName !== "" && parts.length > 0) {
    nativeElement.setAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE, blockName);
  }
}
var sharedStashFunction = (rEl, eventType, listenerFn) => {
  const el = rEl;
  const eventListenerMap = el.__jsaction_fns ?? /* @__PURE__ */ new Map();
  const eventListeners = eventListenerMap.get(eventType) ?? [];
  eventListeners.push(listenerFn);
  eventListenerMap.set(eventType, eventListeners);
  el.__jsaction_fns = eventListenerMap;
};
var sharedMapFunction = (rEl, jsActionMap) => {
  const el = rEl;
  let blockName = el.getAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE) ?? "";
  const blockSet = jsActionMap.get(blockName) ?? /* @__PURE__ */ new Set();
  if (!blockSet.has(el)) {
    blockSet.add(el);
  }
  jsActionMap.set(blockName, blockSet);
};
function removeListenersFromBlocks(blockNames, jsActionMap) {
  if (blockNames.length > 0) {
    let blockList = [];
    for (let blockName of blockNames) {
      if (jsActionMap.has(blockName)) {
        blockList = [...blockList, ...jsActionMap.get(blockName)];
      }
    }
    const replayList = new Set(blockList);
    replayList.forEach(removeListeners);
  }
}
var removeListeners = (el) => {
  el.removeAttribute(Attribute.JSACTION);
  el.removeAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE);
  el.__jsaction_fns = void 0;
};
var JSACTION_EVENT_CONTRACT = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "EVENT_CONTRACT_DETAILS" : "", {
  factory: () => ({})
});
function invokeListeners(event, currentTarget) {
  const handlerFns = currentTarget?.__jsaction_fns?.get(event.type);
  if (!handlerFns || !currentTarget?.isConnected) {
    return;
  }
  for (const handler of handlerFns) {
    handler(event);
  }
}
var stashEventListeners = /* @__PURE__ */ new Map();
function setStashFn(appId, fn) {
  stashEventListeners.set(appId, fn);
  return () => stashEventListeners.delete(appId);
}
var isStashEventListenerImplEnabled = false;
var _stashEventListenerImpl = (lView, target, eventName, wrappedListener) => {
};
function stashEventListenerImpl(lView, target, eventName, wrappedListener) {
  _stashEventListenerImpl(lView, target, eventName, wrappedListener);
}
function enableStashEventListenerImpl() {
  if (!isStashEventListenerImplEnabled) {
    _stashEventListenerImpl = (lView, target, eventName, wrappedListener) => {
      const appId = lView[INJECTOR].get(APP_ID);
      const stashEventListener = stashEventListeners.get(appId);
      stashEventListener?.(target, eventName, wrappedListener);
    };
    isStashEventListenerImplEnabled = true;
  }
}
var DEHYDRATED_BLOCK_REGISTRY = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "DEHYDRATED_BLOCK_REGISTRY" : "");
var DehydratedBlockRegistry = class _DehydratedBlockRegistry {
  registry = /* @__PURE__ */ new Map();
  cleanupFns = /* @__PURE__ */ new Map();
  jsActionMap = inject(JSACTION_BLOCK_ELEMENT_MAP);
  contract = inject(JSACTION_EVENT_CONTRACT);
  add(blockId, info) {
    this.registry.set(blockId, info);
    if (this.awaitingCallbacks.has(blockId)) {
      const awaitingCallbacks = this.awaitingCallbacks.get(blockId);
      for (const cb of awaitingCallbacks) {
        cb();
      }
    }
  }
  get(blockId) {
    return this.registry.get(blockId) ?? null;
  }
  has(blockId) {
    return this.registry.has(blockId);
  }
  cleanup(hydratedBlocks) {
    removeListenersFromBlocks(hydratedBlocks, this.jsActionMap);
    for (let blockId of hydratedBlocks) {
      this.registry.delete(blockId);
      this.jsActionMap.delete(blockId);
      this.invokeTriggerCleanupFns(blockId);
      this.hydrating.delete(blockId);
      this.awaitingCallbacks.delete(blockId);
    }
    if (this.size === 0) {
      this.contract.instance?.cleanUp();
    }
  }
  get size() {
    return this.registry.size;
  }
  addCleanupFn(blockId, fn) {
    let cleanupFunctions = [];
    if (this.cleanupFns.has(blockId)) {
      cleanupFunctions = this.cleanupFns.get(blockId);
    }
    cleanupFunctions.push(fn);
    this.cleanupFns.set(blockId, cleanupFunctions);
  }
  invokeTriggerCleanupFns(blockId) {
    const fns = this.cleanupFns.get(blockId) ?? [];
    for (let fn of fns) {
      fn();
    }
    this.cleanupFns.delete(blockId);
  }
  hydrating = /* @__PURE__ */ new Map();
  awaitingCallbacks = /* @__PURE__ */ new Map();
  awaitParentBlock(topmostParentBlock, callback) {
    const parentBlockAwaitCallbacks = this.awaitingCallbacks.get(topmostParentBlock) ?? [];
    parentBlockAwaitCallbacks.push(callback);
    this.awaitingCallbacks.set(topmostParentBlock, parentBlockAwaitCallbacks);
  }
  static ɵprov = ɵɵdefineInjectable({
    token: _DehydratedBlockRegistry,
    providedIn: null,
    factory: () => new _DehydratedBlockRegistry()
  });
};
function isDetachedByI18n(tNode) {
  return (tNode.flags & 32) === 32;
}
var TRANSFER_STATE_TOKEN_ID = "__nghData__";
var NGH_DATA_KEY = makeStateKey(TRANSFER_STATE_TOKEN_ID);
var TRANSFER_STATE_DEFER_BLOCKS_INFO = "__nghDeferData__";
var NGH_DEFER_BLOCKS_KEY = makeStateKey(TRANSFER_STATE_DEFER_BLOCKS_INFO);
function isInternalHydrationTransferStateKey(key) {
  return key === TRANSFER_STATE_TOKEN_ID || key === TRANSFER_STATE_DEFER_BLOCKS_INFO;
}
var NGH_ATTR_NAME = "ngh";
var SSR_CONTENT_INTEGRITY_MARKER = "nghm";
var _retrieveHydrationInfoImpl = () => null;
function retrieveHydrationInfoImpl(rNode, injector, isRootView2 = false) {
  let nghAttrValue = rNode.getAttribute(NGH_ATTR_NAME);
  if (nghAttrValue == null) return null;
  const [componentViewNgh, rootViewNgh] = nghAttrValue.split("|");
  nghAttrValue = isRootView2 ? rootViewNgh : componentViewNgh;
  if (!nghAttrValue) return null;
  const rootNgh = rootViewNgh ? `|${rootViewNgh}` : "";
  const remainingNgh = isRootView2 ? componentViewNgh : rootNgh;
  let data = {};
  if (nghAttrValue !== "") {
    const transferState = injector.get(TransferState, null, {
      optional: true
    });
    if (transferState !== null) {
      const nghData = transferState.get(NGH_DATA_KEY, []);
      data = nghData[Number(nghAttrValue)];
      ngDevMode && assertDefined(data, "Unable to retrieve hydration info from the TransferState.");
    }
  }
  const dehydratedView = {
    data,
    firstChild: rNode.firstChild ?? null
  };
  if (isRootView2) {
    dehydratedView.firstChild = rNode;
    setSegmentHead(dehydratedView, 0, rNode.nextSibling);
  }
  if (remainingNgh) {
    rNode.setAttribute(NGH_ATTR_NAME, remainingNgh);
  } else {
    rNode.removeAttribute(NGH_ATTR_NAME);
  }
  ngDevMode && markRNodeAsClaimedByHydration(rNode, false);
  ngDevMode && ngDevMode.hydratedComponents++;
  return dehydratedView;
}
function enableRetrieveHydrationInfoImpl() {
  _retrieveHydrationInfoImpl = retrieveHydrationInfoImpl;
}
function retrieveHydrationInfo(rNode, injector, isRootView2 = false) {
  return _retrieveHydrationInfoImpl(rNode, injector, isRootView2);
}
function getLNodeForHydration(viewRef) {
  let lView = viewRef._lView;
  const tView = lView[TVIEW];
  if (tView.type === 2) {
    return null;
  }
  if (isRootView(lView)) {
    lView = lView[HEADER_OFFSET];
  }
  return lView;
}
function getTextNodeContent(node) {
  return node.textContent?.replace(/\s/gm, "");
}
function processTextNodeMarkersBeforeHydration(node) {
  const doc = getDocument();
  const commentNodesIterator = doc.createNodeIterator(node, NodeFilter.SHOW_COMMENT, {
    acceptNode(node2) {
      const content = getTextNodeContent(node2);
      const isTextNodeMarker = content === "ngetn" || content === "ngtns";
      return isTextNodeMarker ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  let currentNode;
  const nodes = [];
  while (currentNode = commentNodesIterator.nextNode()) {
    nodes.push(currentNode);
  }
  for (const node2 of nodes) {
    if (node2.textContent === "ngetn") {
      node2.replaceWith(doc.createTextNode(""));
    } else {
      node2.remove();
    }
  }
}
var HydrationStatus;
(function(HydrationStatus2) {
  HydrationStatus2["Hydrated"] = "hydrated";
  HydrationStatus2["Skipped"] = "skipped";
  HydrationStatus2["Mismatched"] = "mismatched";
})(HydrationStatus || (HydrationStatus = {}));
var HYDRATION_INFO_KEY = "__ngDebugHydrationInfo__";
function patchHydrationInfo(node, info) {
  node[HYDRATION_INFO_KEY] = info;
}
function readHydrationInfo(node) {
  return node[HYDRATION_INFO_KEY] ?? null;
}
function markRNodeAsClaimedByHydration(node, checkIfAlreadyClaimed = true) {
  if (!ngDevMode) {
    throw new Error("Calling `markRNodeAsClaimedByHydration` in prod mode is not supported and likely a mistake.");
  }
  if (checkIfAlreadyClaimed && isRNodeClaimedForHydration(node)) {
    throw new Error("Trying to claim a node, which was claimed already.");
  }
  patchHydrationInfo(node, {
    status: HydrationStatus.Hydrated
  });
  ngDevMode.hydratedNodes++;
}
function markRNodeAsSkippedByHydration(node) {
  if (!ngDevMode) {
    throw new Error("Calling `markRNodeAsSkippedByHydration` in prod mode is not supported and likely a mistake.");
  }
  patchHydrationInfo(node, {
    status: HydrationStatus.Skipped
  });
  ngDevMode.componentsSkippedHydration++;
}
function countBlocksSkippedByHydration(injector) {
  const transferState = injector.get(TransferState);
  const nghDeferData = transferState.get(NGH_DEFER_BLOCKS_KEY, {});
  if (ngDevMode) {
    ngDevMode.deferBlocksWithIncrementalHydration = Object.keys(nghDeferData).length;
  }
}
function markRNodeAsHavingHydrationMismatch(node, expectedNodeDetails = null, actualNodeDetails = null) {
  if (!ngDevMode) {
    throw new Error("Calling `markRNodeAsMismatchedByHydration` in prod mode is not supported and likely a mistake.");
  }
  while (node && !getComponent(node)) {
    node = node?.parentNode;
  }
  if (node) {
    patchHydrationInfo(node, {
      status: HydrationStatus.Mismatched,
      expectedNodeDetails,
      actualNodeDetails
    });
  }
}
function isRNodeClaimedForHydration(node) {
  return readHydrationInfo(node)?.status === HydrationStatus.Hydrated;
}
function setSegmentHead(hydrationInfo, index, node) {
  hydrationInfo.segmentHeads ??= {};
  hydrationInfo.segmentHeads[index] = node;
}
function getSegmentHead(hydrationInfo, index) {
  return hydrationInfo.segmentHeads?.[index] ?? null;
}
function isIncrementalHydrationEnabled(injector) {
  return injector.get(IS_INCREMENTAL_HYDRATION_ENABLED, false, {
    optional: true
  });
}
var incrementalHydrationEnabledWarned = false;
function resetIncrementalHydrationEnabledWarnedForTests() {
  incrementalHydrationEnabledWarned = false;
}
function warnIncrementalHydrationNotConfigured() {
  if (!incrementalHydrationEnabledWarned) {
    incrementalHydrationEnabledWarned = true;
    console.warn(formatRuntimeError(508, "Angular has detected that some `@defer` blocks use `hydrate` triggers, but incremental hydration was not enabled. Please ensure that the `withIncrementalHydration()` call is added as an argument for the `provideClientHydration()` function call in your application config."));
  }
}
function assertSsrIdDefined(ssrUniqueId) {
  assertDefined(ssrUniqueId, "Internal error: expecting an SSR id for a defer block that should be hydrated, but the id is not present");
}
function getNgContainerSize(hydrationInfo, index) {
  const data = hydrationInfo.data;
  let size = data[ELEMENT_CONTAINERS]?.[index] ?? null;
  if (size === null && data[CONTAINERS]?.[index]) {
    size = calcSerializedContainerSize(hydrationInfo, index);
  }
  return size;
}
function isSerializedElementContainer(hydrationInfo, index) {
  return hydrationInfo.data[ELEMENT_CONTAINERS]?.[index] !== void 0;
}
function getSerializedContainerViews(hydrationInfo, index) {
  return hydrationInfo.data[CONTAINERS]?.[index] ?? null;
}
function calcSerializedContainerSize(hydrationInfo, index) {
  const views = getSerializedContainerViews(hydrationInfo, index) ?? [];
  let numNodes = 0;
  for (let view of views) {
    numNodes += view[NUM_ROOT_NODES] * (view[MULTIPLIER] ?? 1);
  }
  return numNodes;
}
function initDisconnectedNodes(hydrationInfo) {
  if (typeof hydrationInfo.disconnectedNodes === "undefined") {
    const nodeIds = hydrationInfo.data[DISCONNECTED_NODES];
    hydrationInfo.disconnectedNodes = nodeIds ? new Set(nodeIds) : null;
  }
  return hydrationInfo.disconnectedNodes;
}
function isDisconnectedNode$1(hydrationInfo, index) {
  if (typeof hydrationInfo.disconnectedNodes === "undefined") {
    const nodeIds = hydrationInfo.data[DISCONNECTED_NODES];
    hydrationInfo.disconnectedNodes = nodeIds ? new Set(nodeIds) : null;
  }
  return !!initDisconnectedNodes(hydrationInfo)?.has(index);
}
function canHydrateNode(lView, tNode) {
  const hydrationInfo = lView[HYDRATION];
  return hydrationInfo !== null && !isInSkipHydrationBlock() && !isDetachedByI18n(tNode) && !isDisconnectedNode$1(hydrationInfo, tNode.index - HEADER_OFFSET);
}
function processTextNodeBeforeSerialization(context, node) {
  const el = node;
  const corruptedTextNodes = context.corruptedTextNodes;
  if (el.textContent === "") {
    corruptedTextNodes.set(el, "ngetn");
  } else if (el.nextSibling?.nodeType === Node.TEXT_NODE) {
    corruptedTextNodes.set(el, "ngtns");
  }
}
function convertHydrateTriggersToJsAction(triggers) {
  let actionList = [];
  if (triggers !== null) {
    if (triggers.has(4)) {
      actionList.push(...hoverEventNames);
    }
    if (triggers.has(3)) {
      actionList.push(...interactionEventNames);
    }
  }
  return actionList;
}
function getParentBlockHydrationQueue(deferBlockId, injector) {
  const dehydratedBlockRegistry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
  const transferState = injector.get(TransferState);
  const deferBlockParents = transferState.get(NGH_DEFER_BLOCKS_KEY, {});
  let isTopMostDeferBlock = false;
  let currentBlockId = deferBlockId;
  let parentBlockPromise = null;
  const hydrationQueue = [];
  while (!isTopMostDeferBlock && currentBlockId) {
    ngDevMode && assertEqual(hydrationQueue.indexOf(currentBlockId), -1, "Internal error: defer block hierarchy has a cycle.");
    isTopMostDeferBlock = dehydratedBlockRegistry.has(currentBlockId);
    const hydratingParentBlock = dehydratedBlockRegistry.hydrating.get(currentBlockId);
    if (parentBlockPromise === null && hydratingParentBlock != null) {
      parentBlockPromise = hydratingParentBlock.promise;
      break;
    }
    hydrationQueue.unshift(currentBlockId);
    currentBlockId = deferBlockParents[currentBlockId][DEFER_PARENT_BLOCK_ID];
  }
  return {
    parentBlockPromise,
    hydrationQueue
  };
}
function gatherDeferBlocksByJSActionAttribute(doc) {
  const jsactionNodes = doc.body.querySelectorAll("[jsaction]");
  const blockMap = /* @__PURE__ */ new Set();
  const eventTypes = [hoverEventNames.join(":;"), interactionEventNames.join(":;")].join("|");
  for (let node of jsactionNodes) {
    const attr = node.getAttribute("jsaction");
    const blockId = node.getAttribute("ngb");
    if (attr?.match(eventTypes) && blockId !== null) {
      blockMap.add(node);
    }
  }
  return blockMap;
}
function appendDeferBlocksToJSActionMap(doc, injector) {
  const blockMap = gatherDeferBlocksByJSActionAttribute(doc);
  const jsActionMap = injector.get(JSACTION_BLOCK_ELEMENT_MAP);
  for (let rNode of blockMap) {
    sharedMapFunction(rNode, jsActionMap);
  }
}
var _retrieveDeferBlockDataImpl = () => {
  return {};
};
function retrieveDeferBlockDataImpl(injector) {
  const transferState = injector.get(TransferState, null, {
    optional: true
  });
  if (transferState !== null) {
    const nghDeferData = transferState.get(NGH_DEFER_BLOCKS_KEY, {});
    ngDevMode && assertDefined(nghDeferData, "Unable to retrieve defer block info from the TransferState.");
    return nghDeferData;
  }
  return {};
}
function enableRetrieveDeferBlockDataImpl() {
  _retrieveDeferBlockDataImpl = retrieveDeferBlockDataImpl;
}
function retrieveDeferBlockData(injector) {
  return _retrieveDeferBlockDataImpl(injector);
}
function isTimerTrigger(triggerInfo) {
  return typeof triggerInfo === "object" && triggerInfo.trigger === 5;
}
function getHydrateTimerTrigger(blockData) {
  const trigger = blockData[DEFER_HYDRATE_TRIGGERS]?.find((t) => isTimerTrigger(t));
  return trigger?.delay ?? null;
}
function getHydrateViewportTrigger(blockData) {
  const details = blockData[DEFER_HYDRATE_TRIGGERS];
  if (details) {
    for (const current of details) {
      if (current === 2) {
        return true;
      } else if (typeof current === "object" && current.trigger === 2) {
        return current.intersectionObserverOptions || true;
      }
    }
  }
  return null;
}
function hasHydrateTrigger(blockData, trigger) {
  return blockData[DEFER_HYDRATE_TRIGGERS]?.includes(trigger) ?? false;
}
function createBlockSummary(blockInfo) {
  return {
    data: blockInfo,
    hydrate: {
      idle: hasHydrateTrigger(blockInfo, 0),
      immediate: hasHydrateTrigger(blockInfo, 1),
      timer: getHydrateTimerTrigger(blockInfo),
      viewport: getHydrateViewportTrigger(blockInfo)
    }
  };
}
function processBlockData(injector) {
  const blockData = retrieveDeferBlockData(injector);
  let blockDetails = /* @__PURE__ */ new Map();
  for (let blockId in blockData) {
    blockDetails.set(blockId, createBlockSummary(blockData[blockId]));
  }
  return blockDetails;
}
function isSsrContentsIntegrity(node) {
  return !!node && node.nodeType === Node.COMMENT_NODE && node.textContent?.trim() === SSR_CONTENT_INTEGRITY_MARKER;
}
function skipTextNodes(node) {
  while (node && node.nodeType === Node.TEXT_NODE) {
    node = node.previousSibling;
  }
  return node;
}
function verifySsrContentsIntegrity(doc) {
  for (const node of doc.body.childNodes) {
    if (isSsrContentsIntegrity(node)) {
      return;
    }
  }
  const beforeBody = skipTextNodes(doc.body.previousSibling);
  if (isSsrContentsIntegrity(beforeBody)) {
    return;
  }
  let endOfHead = skipTextNodes(doc.head.lastChild);
  if (isSsrContentsIntegrity(endOfHead)) {
    return;
  }
  throw new RuntimeError(-507, typeof ngDevMode !== "undefined" && ngDevMode && "Angular hydration logic detected that HTML content of this page was modified after it was produced during server side rendering. Make sure that there are no optimizations that remove comment nodes from HTML enabled on your CDN. Angular hydration relies on HTML produced by the server, including whitespaces and comment nodes.");
}
function refreshContentQueries(tView, lView) {
  const contentQueries = tView.contentQueries;
  if (contentQueries !== null) {
    const prevConsumer = setActiveConsumer(null);
    try {
      for (let i = 0; i < contentQueries.length; i += 2) {
        const queryStartIdx = contentQueries[i];
        const directiveDefIdx = contentQueries[i + 1];
        if (directiveDefIdx !== -1) {
          const directiveDef = tView.data[directiveDefIdx];
          ngDevMode && assertDefined(directiveDef, "DirectiveDef not found.");
          ngDevMode && assertDefined(directiveDef.contentQueries, "contentQueries function should be defined");
          setCurrentQueryIndex(queryStartIdx);
          directiveDef.contentQueries(2, lView[directiveDefIdx], directiveDefIdx);
        }
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}
function executeViewQueryFn(flags, viewQueryFn, component) {
  ngDevMode && assertDefined(viewQueryFn, "View queries function to execute must be defined.");
  setCurrentQueryIndex(0);
  const prevConsumer = setActiveConsumer(null);
  try {
    viewQueryFn(flags, component);
  } finally {
    setActiveConsumer(prevConsumer);
  }
}
function executeContentQueries(tView, tNode, lView) {
  if (isContentQueryHost(tNode)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      const start = tNode.directiveStart;
      const end = tNode.directiveEnd;
      for (let directiveIndex = start; directiveIndex < end; directiveIndex++) {
        const def = tView.data[directiveIndex];
        if (def.contentQueries) {
          const directiveInstance = lView[directiveIndex];
          ngDevMode && assertDefined(directiveIndex, "Incorrect reference to a directive defining a content query");
          def.contentQueries(1, directiveInstance, directiveIndex);
        }
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}
var ViewEncapsulation;
(function(ViewEncapsulation3) {
  ViewEncapsulation3[ViewEncapsulation3["Emulated"] = 0] = "Emulated";
  ViewEncapsulation3[ViewEncapsulation3["None"] = 2] = "None";
  ViewEncapsulation3[ViewEncapsulation3["ShadowDom"] = 3] = "ShadowDom";
  ViewEncapsulation3[ViewEncapsulation3["ExperimentalIsolatedShadowDom"] = 4] = "ExperimentalIsolatedShadowDom";
})(ViewEncapsulation || (ViewEncapsulation = {}));
var CUSTOM_ELEMENTS_SCHEMA = {
  name: "custom-elements"
};
var NO_ERRORS_SCHEMA = {
  name: "no-errors-schema"
};
var shouldThrowErrorOnUnknownElement = false;
function ɵsetUnknownElementStrictMode(shouldThrow) {
  shouldThrowErrorOnUnknownElement = shouldThrow;
}
function ɵgetUnknownElementStrictMode() {
  return shouldThrowErrorOnUnknownElement;
}
var shouldThrowErrorOnUnknownProperty = false;
function ɵsetUnknownPropertyStrictMode(shouldThrow) {
  shouldThrowErrorOnUnknownProperty = shouldThrow;
}
function ɵgetUnknownPropertyStrictMode() {
  return shouldThrowErrorOnUnknownProperty;
}
function validateElementIsKnown(lView, tNode) {
  const tView = lView[TVIEW];
  if (tView.schemas === null) return;
  const tagName = tNode.value;
  if (!isDirectiveHost(tNode) && tagName !== null) {
    const isUnknown = typeof HTMLUnknownElement !== "undefined" && HTMLUnknownElement && getNativeByTNode(tNode, lView) instanceof HTMLUnknownElement || typeof customElements !== "undefined" && tagName.indexOf("-") > -1 && !customElements.get(tagName);
    if (isUnknown && !matchingSchemas(tView.schemas, tagName)) {
      const isHostStandalone = isHostComponentStandalone(lView);
      const templateLocation = getTemplateLocationDetails(lView);
      const schemas = `'${isHostStandalone ? "@Component" : "@NgModule"}.schemas'`;
      let message = `'${tagName}' is not a known element${templateLocation}:
`;
      message += `1. If '${tagName}' is an Angular component, then verify that it is ${isHostStandalone ? "included in the '@Component.imports' of this component" : "a part of an @NgModule where this component is declared"}.
`;
      if (tagName && tagName.indexOf("-") > -1) {
        message += `2. If '${tagName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemas} of this component to suppress this message.`;
      } else {
        message += `2. To allow any element add 'NO_ERRORS_SCHEMA' to the ${schemas} of this component.`;
      }
      if (shouldThrowErrorOnUnknownElement) {
        throw new RuntimeError(304, message);
      } else {
        console.error(formatRuntimeError(304, message));
      }
    }
  }
}
function isPropertyValid(element, propName, tagName, schemas) {
  if (schemas === null) return true;
  if (matchingSchemas(schemas, tagName) || propName in element || isAnimationProp(propName)) {
    return true;
  }
  return typeof Node === "undefined" || Node === null || !(element instanceof Node);
}
function handleUnknownPropertyError(propName, tagName, nodeType, lView) {
  if (!tagName && nodeType === 4) {
    tagName = "ng-template";
  }
  const isHostStandalone = isHostComponentStandalone(lView);
  const templateLocation = getTemplateLocationDetails(lView);
  let message = `Can't bind to '${propName}' since it isn't a known property of '${tagName}'${templateLocation}.`;
  const schemas = `'${isHostStandalone ? "@Component" : "@NgModule"}.schemas'`;
  const importLocation = isHostStandalone ? "included in the '@Component.imports' of this component" : "a part of an @NgModule where this component is declared";
  if (KNOWN_CONTROL_FLOW_DIRECTIVES.has(propName)) {
    const correspondingImport = KNOWN_CONTROL_FLOW_DIRECTIVES.get(propName);
    message += `
If the '${propName}' is an Angular control flow directive, please make sure that either the '${correspondingImport}' directive or the 'CommonModule' is ${importLocation}.`;
  } else {
    message += `
1. If '${tagName}' is an Angular component and it has the '${propName}' input, then verify that it is ${importLocation}.`;
    if (tagName && tagName.indexOf("-") > -1) {
      message += `
2. If '${tagName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemas} of this component to suppress this message.`;
      message += `
3. To allow any property add 'NO_ERRORS_SCHEMA' to the ${schemas} of this component.`;
    } else {
      message += `
2. To allow any property add 'NO_ERRORS_SCHEMA' to the ${schemas} of this component.`;
    }
  }
  reportUnknownPropertyError(message);
}
function reportUnknownPropertyError(message) {
  if (shouldThrowErrorOnUnknownProperty) {
    throw new RuntimeError(303, message);
  } else {
    console.error(formatRuntimeError(303, message));
  }
}
function getDeclarationComponentDef(lView) {
  !ngDevMode && throwError("Must never be called in production mode");
  const declarationLView = lView[DECLARATION_COMPONENT_VIEW];
  const context = declarationLView[CONTEXT];
  if (!context) return null;
  return context.constructor ? getComponentDef(context.constructor) : null;
}
function isHostComponentStandalone(lView) {
  !ngDevMode && throwError("Must never be called in production mode");
  const componentDef = getDeclarationComponentDef(lView);
  return !!componentDef?.standalone;
}
function getTemplateLocationDetails(lView) {
  !ngDevMode && throwError("Must never be called in production mode");
  const hostComponentDef = getDeclarationComponentDef(lView);
  const componentClassName = hostComponentDef?.type?.name;
  return componentClassName ? ` (used in the '${componentClassName}' component template)` : "";
}
var KNOWN_CONTROL_FLOW_DIRECTIVES = /* @__PURE__ */ new Map([["ngIf", "NgIf"], ["ngFor", "NgFor"], ["ngSwitchCase", "NgSwitchCase"], ["ngSwitchDefault", "NgSwitchDefault"]]);
function matchingSchemas(schemas, tagName) {
  if (schemas !== null) {
    for (let i = 0; i < schemas.length; i++) {
      const schema = schemas[i];
      if (schema === NO_ERRORS_SCHEMA || schema === CUSTOM_ELEMENTS_SCHEMA && tagName && tagName.indexOf("-") > -1) {
        return true;
      }
    }
  }
  return false;
}
var policy$1;
function getPolicy$1() {
  if (policy$1 === void 0) {
    policy$1 = null;
    if (_global.trustedTypes) {
      try {
        policy$1 = _global.trustedTypes.createPolicy("angular", {
          createHTML: (s) => s,
          createScript: (s) => s,
          createScriptURL: (s) => s
        });
      } catch {
      }
    }
  }
  return policy$1;
}
function trustedHTMLFromString(html) {
  return getPolicy$1()?.createHTML(html) || html;
}
function trustedScriptURLFromString(url) {
  return getPolicy$1()?.createScriptURL(url) || url;
}
var policy;
function getPolicy() {
  if (policy === void 0) {
    policy = null;
    if (_global.trustedTypes) {
      try {
        policy = _global.trustedTypes.createPolicy("angular#unsafe-bypass", {
          createHTML: (s) => s,
          createScript: (s) => s,
          createScriptURL: (s) => s
        });
      } catch {
      }
    }
  }
  return policy;
}
function trustedHTMLFromStringBypass(html) {
  return getPolicy()?.createHTML(html) || html;
}
function trustedScriptFromStringBypass(script) {
  return getPolicy()?.createScript(script) || script;
}
function trustedScriptURLFromStringBypass(url) {
  return getPolicy()?.createScriptURL(url) || url;
}
var SafeValueImpl = class {
  changingThisBreaksApplicationSecurity;
  constructor(changingThisBreaksApplicationSecurity) {
    this.changingThisBreaksApplicationSecurity = changingThisBreaksApplicationSecurity;
  }
  toString() {
    return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${XSS_SECURITY_URL})`;
  }
};
var SafeHtmlImpl = class extends SafeValueImpl {
  getTypeName() {
    return "HTML";
  }
};
var SafeStyleImpl = class extends SafeValueImpl {
  getTypeName() {
    return "Style";
  }
};
var SafeScriptImpl = class extends SafeValueImpl {
  getTypeName() {
    return "Script";
  }
};
var SafeUrlImpl = class extends SafeValueImpl {
  getTypeName() {
    return "URL";
  }
};
var SafeResourceUrlImpl = class extends SafeValueImpl {
  getTypeName() {
    return "ResourceURL";
  }
};
function unwrapSafeValue(value) {
  return value instanceof SafeValueImpl ? value.changingThisBreaksApplicationSecurity : value;
}
function allowSanitizationBypassAndThrow(value, type) {
  const actualType = getSanitizationBypassType(value);
  if (actualType != null && actualType !== type) {
    if (actualType === "ResourceURL" && type === "URL") return true;
    throw new Error(`Required a safe ${type}, got a ${actualType} (see ${XSS_SECURITY_URL})`);
  }
  return actualType === type;
}
function getSanitizationBypassType(value) {
  return value instanceof SafeValueImpl && value.getTypeName() || null;
}
function bypassSanitizationTrustHtml(trustedHtml) {
  return new SafeHtmlImpl(trustedHtml);
}
function bypassSanitizationTrustStyle(trustedStyle) {
  return new SafeStyleImpl(trustedStyle);
}
function bypassSanitizationTrustScript(trustedScript) {
  return new SafeScriptImpl(trustedScript);
}
function bypassSanitizationTrustUrl(trustedUrl) {
  return new SafeUrlImpl(trustedUrl);
}
function bypassSanitizationTrustResourceUrl(trustedResourceUrl) {
  return new SafeResourceUrlImpl(trustedResourceUrl);
}
function getInertBodyHelper(defaultDoc) {
  const inertDocumentHelper = new InertDocumentHelper(defaultDoc);
  return isDOMParserAvailable() ? new DOMParserHelper(inertDocumentHelper) : inertDocumentHelper;
}
var DOMParserHelper = class {
  inertDocumentHelper;
  constructor(inertDocumentHelper) {
    this.inertDocumentHelper = inertDocumentHelper;
  }
  getInertBodyElement(html) {
    html = "<body><remove></remove>" + html;
    try {
      const body = new window.DOMParser().parseFromString(trustedHTMLFromString(html), "text/html").body;
      if (body === null) {
        return this.inertDocumentHelper.getInertBodyElement(html);
      }
      body.firstChild?.remove();
      return body;
    } catch {
      return null;
    }
  }
};
var InertDocumentHelper = class {
  defaultDoc;
  inertDocument;
  constructor(defaultDoc) {
    this.defaultDoc = defaultDoc;
    this.inertDocument = this.defaultDoc.implementation.createHTMLDocument("sanitization-inert");
  }
  getInertBodyElement(html) {
    const templateEl = this.inertDocument.createElement("template");
    templateEl.innerHTML = trustedHTMLFromString(html);
    return templateEl;
  }
};
function isDOMParserAvailable() {
  try {
    return !!new window.DOMParser().parseFromString(trustedHTMLFromString(""), "text/html");
  } catch {
    return false;
  }
}
var SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;
function _sanitizeUrl(url) {
  url = String(url);
  if (url.match(SAFE_URL_PATTERN)) return url;
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    console.warn(`WARNING: sanitizing unsafe URL value ${url} (see ${XSS_SECURITY_URL})`);
  }
  return "unsafe:" + url;
}
function tagSet(tags) {
  const res = {};
  for (const t of tags.split(",")) res[t] = true;
  return res;
}
function merge(...sets) {
  const res = {};
  for (const s of sets) {
    for (const v in s) {
      if (s.hasOwnProperty(v)) res[v] = true;
    }
  }
  return res;
}
var VOID_ELEMENTS = tagSet("area,br,col,hr,img,wbr");
var OPTIONAL_END_TAG_BLOCK_ELEMENTS = tagSet("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr");
var OPTIONAL_END_TAG_INLINE_ELEMENTS = tagSet("rp,rt");
var OPTIONAL_END_TAG_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, OPTIONAL_END_TAG_BLOCK_ELEMENTS);
var BLOCK_ELEMENTS = merge(OPTIONAL_END_TAG_BLOCK_ELEMENTS, tagSet("address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul"));
var INLINE_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, tagSet("a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video"));
var VALID_ELEMENTS = merge(VOID_ELEMENTS, BLOCK_ELEMENTS, INLINE_ELEMENTS, OPTIONAL_END_TAG_ELEMENTS);
var URI_ATTRS = tagSet("background,cite,href,itemtype,longdesc,poster,src,xlink:href");
var HTML_ATTRS = tagSet("abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,srcset,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width");
var ARIA_ATTRS = tagSet("aria-activedescendant,aria-atomic,aria-autocomplete,aria-busy,aria-checked,aria-colcount,aria-colindex,aria-colspan,aria-controls,aria-current,aria-describedby,aria-details,aria-disabled,aria-dropeffect,aria-errormessage,aria-expanded,aria-flowto,aria-grabbed,aria-haspopup,aria-hidden,aria-invalid,aria-keyshortcuts,aria-label,aria-labelledby,aria-level,aria-live,aria-modal,aria-multiline,aria-multiselectable,aria-orientation,aria-owns,aria-placeholder,aria-posinset,aria-pressed,aria-readonly,aria-relevant,aria-required,aria-roledescription,aria-rowcount,aria-rowindex,aria-rowspan,aria-selected,aria-setsize,aria-sort,aria-valuemax,aria-valuemin,aria-valuenow,aria-valuetext");
var VALID_ATTRS = merge(URI_ATTRS, HTML_ATTRS, ARIA_ATTRS);
var SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS = tagSet("script,style,template");
var SanitizingHtmlSerializer = class {
  sanitizedSomething = false;
  buf = [];
  sanitizeChildren(el) {
    let current = el.firstChild;
    let traverseContent = true;
    let parentNodes = [];
    while (current) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        traverseContent = this.startElement(current);
      } else if (current.nodeType === Node.TEXT_NODE) {
        this.chars(current.nodeValue);
      } else {
        this.sanitizedSomething = true;
      }
      if (traverseContent && current.firstChild) {
        parentNodes.push(current);
        current = getFirstChild(current);
        continue;
      }
      while (current) {
        if (current.nodeType === Node.ELEMENT_NODE) {
          this.endElement(current);
        }
        let next = getNextSibling(current);
        if (next) {
          current = next;
          break;
        }
        current = parentNodes.pop();
      }
    }
    return this.buf.join("");
  }
  startElement(element) {
    const tagName = getNodeName(element).toLowerCase();
    if (!VALID_ELEMENTS.hasOwnProperty(tagName)) {
      this.sanitizedSomething = true;
      return !SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS.hasOwnProperty(tagName);
    }
    this.buf.push("<");
    this.buf.push(tagName);
    const elAttrs = element.attributes;
    for (let i = 0; i < elAttrs.length; i++) {
      const elAttr = elAttrs.item(i);
      const attrName = elAttr.name;
      const lower = attrName.toLowerCase();
      if (!VALID_ATTRS.hasOwnProperty(lower)) {
        this.sanitizedSomething = true;
        continue;
      }
      let value = elAttr.value;
      if (URI_ATTRS[lower]) value = _sanitizeUrl(value);
      this.buf.push(" ", attrName, '="', encodeEntities(value), '"');
    }
    this.buf.push(">");
    return true;
  }
  endElement(current) {
    const tagName = getNodeName(current).toLowerCase();
    if (VALID_ELEMENTS.hasOwnProperty(tagName) && !VOID_ELEMENTS.hasOwnProperty(tagName)) {
      this.buf.push("</");
      this.buf.push(tagName);
      this.buf.push(">");
    }
  }
  chars(chars) {
    this.buf.push(encodeEntities(chars));
  }
};
function isClobberedElement(parentNode, childNode) {
  return (parentNode.compareDocumentPosition(childNode) & Node.DOCUMENT_POSITION_CONTAINED_BY) !== Node.DOCUMENT_POSITION_CONTAINED_BY;
}
function getNextSibling(node) {
  const nextSibling = node.nextSibling;
  if (nextSibling && node !== nextSibling.previousSibling) {
    throw clobberedElementError(nextSibling);
  }
  return nextSibling;
}
function getFirstChild(node) {
  const firstChild = node.firstChild;
  if (firstChild && isClobberedElement(node, firstChild)) {
    throw clobberedElementError(firstChild);
  }
  return firstChild;
}
function getNodeName(node) {
  const nodeName = node.nodeName;
  return typeof nodeName === "string" ? nodeName : "FORM";
}
function clobberedElementError(node) {
  return new Error(`Failed to sanitize html because the element is clobbered: ${node.outerHTML}`);
}
var SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var NON_ALPHANUMERIC_REGEXP = /([^\#-~ |!])/g;
function encodeEntities(value) {
  return value.replace(/&/g, "&amp;").replace(SURROGATE_PAIR_REGEXP, function(match) {
    const hi = match.charCodeAt(0);
    const low = match.charCodeAt(1);
    return "&#" + ((hi - 55296) * 1024 + (low - 56320) + 65536) + ";";
  }).replace(NON_ALPHANUMERIC_REGEXP, function(match) {
    return "&#" + match.charCodeAt(0) + ";";
  }).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
var inertBodyHelper;
function _sanitizeHtml(defaultDoc, unsafeHtmlInput) {
  let inertBodyElement = null;
  try {
    inertBodyHelper = inertBodyHelper || getInertBodyHelper(defaultDoc);
    let unsafeHtml = unsafeHtmlInput ? String(unsafeHtmlInput) : "";
    inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
    let mXSSAttempts = 5;
    let parsedHtml = unsafeHtml;
    do {
      if (mXSSAttempts === 0) {
        throw new Error("Failed to sanitize html because the input is unstable");
      }
      mXSSAttempts--;
      unsafeHtml = parsedHtml;
      parsedHtml = inertBodyElement.innerHTML;
      inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
    } while (unsafeHtml !== parsedHtml);
    const sanitizer = new SanitizingHtmlSerializer();
    const safeHtml = sanitizer.sanitizeChildren(getTemplateContent(inertBodyElement) || inertBodyElement);
    if ((typeof ngDevMode === "undefined" || ngDevMode) && sanitizer.sanitizedSomething) {
      console.warn(`WARNING: sanitizing HTML stripped some content, see ${XSS_SECURITY_URL}`);
    }
    return trustedHTMLFromString(safeHtml);
  } finally {
    if (inertBodyElement) {
      const parent = getTemplateContent(inertBodyElement) || inertBodyElement;
      while (parent.firstChild) {
        parent.firstChild.remove();
      }
    }
  }
}
function getTemplateContent(el) {
  return "content" in el && isTemplateElement(el) ? el.content : null;
}
function isTemplateElement(el) {
  return el.nodeType === Node.ELEMENT_NODE && el.nodeName === "TEMPLATE";
}
var COMMENT_DISALLOWED = /^>|^->|<!--|-->|--!>|<!-$/g;
var COMMENT_DELIMITER = /(<|>)/g;
var COMMENT_DELIMITER_ESCAPED = "​$1​";
function escapeCommentText(value) {
  return value.replace(COMMENT_DISALLOWED, (text) => text.replace(COMMENT_DELIMITER, COMMENT_DELIMITER_ESCAPED));
}
function createTextNode(renderer, value) {
  return renderer.createText(value);
}
function updateTextNode(renderer, rNode, value) {
  renderer.setValue(rNode, value);
}
function createCommentNode(renderer, value) {
  return renderer.createComment(escapeCommentText(value));
}
function createElementNode(renderer, name, namespace) {
  return renderer.createElement(name, namespace);
}
function nativeInsertBefore(renderer, parent, child, beforeNode, isMove) {
  renderer.insertBefore(parent, child, beforeNode, isMove);
}
function nativeAppendChild(renderer, parent, child) {
  ngDevMode && assertDefined(parent, "parent node must be defined");
  renderer.appendChild(parent, child);
}
function nativeAppendOrInsertBefore(renderer, parent, child, beforeNode, isMove) {
  if (beforeNode !== null) {
    nativeInsertBefore(renderer, parent, child, beforeNode, isMove);
  } else {
    nativeAppendChild(renderer, parent, child);
  }
}
function nativeRemoveNode(renderer, rNode, isHostElement, requireSynchronousElementRemoval) {
  renderer.removeChild(null, rNode, isHostElement, requireSynchronousElementRemoval);
}
function clearElementContents(rElement) {
  rElement.textContent = "";
}
function writeDirectStyle(renderer, element, newValue) {
  ngDevMode && assertString(newValue, "'newValue' should be a string");
  renderer.setAttribute(element, "style", newValue);
}
function writeDirectClass(renderer, element, newValue) {
  ngDevMode && assertString(newValue, "'newValue' should be a string");
  if (newValue === "") {
    renderer.removeAttribute(element, "class");
  } else {
    renderer.setAttribute(element, "class", newValue);
  }
}
function setupStaticAttributes(renderer, element, tNode) {
  const {
    mergedAttrs,
    classes,
    styles
  } = tNode;
  if (mergedAttrs !== null) {
    setUpAttributes(renderer, element, mergedAttrs);
  }
  if (classes !== null) {
    writeDirectClass(renderer, element, classes);
  }
  if (styles !== null) {
    writeDirectStyle(renderer, element, styles);
  }
}
function enforceIframeSecurity(iframe) {
  const lView = getLView();
  iframe.src = "";
  iframe.srcdoc = trustedHTMLFromString("");
  nativeRemoveNode(lView[RENDERER], iframe);
}
var SecurityContext;
(function(SecurityContext2) {
  SecurityContext2[SecurityContext2["NONE"] = 0] = "NONE";
  SecurityContext2[SecurityContext2["HTML"] = 1] = "HTML";
  SecurityContext2[SecurityContext2["STYLE"] = 2] = "STYLE";
  SecurityContext2[SecurityContext2["SCRIPT"] = 3] = "SCRIPT";
  SecurityContext2[SecurityContext2["URL"] = 4] = "URL";
  SecurityContext2[SecurityContext2["RESOURCE_URL"] = 5] = "RESOURCE_URL";
})(SecurityContext || (SecurityContext = {}));
function ɵɵsanitizeHtml(unsafeHtml) {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedHTMLFromStringBypass(sanitizer.sanitize(SecurityContext.HTML, unsafeHtml) || "");
  }
  if (allowSanitizationBypassAndThrow(unsafeHtml, "HTML")) {
    return trustedHTMLFromStringBypass(unwrapSafeValue(unsafeHtml));
  }
  return _sanitizeHtml(getDocument(), renderStringify(unsafeHtml));
}
function ɵɵsanitizeStyle(unsafeStyle) {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return sanitizer.sanitize(SecurityContext.STYLE, unsafeStyle) || "";
  }
  if (allowSanitizationBypassAndThrow(unsafeStyle, "Style")) {
    return unwrapSafeValue(unsafeStyle);
  }
  return renderStringify(unsafeStyle);
}
function ɵɵsanitizeUrl(unsafeUrl) {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return sanitizer.sanitize(SecurityContext.URL, unsafeUrl) || "";
  }
  if (allowSanitizationBypassAndThrow(unsafeUrl, "URL")) {
    return unwrapSafeValue(unsafeUrl);
  }
  return _sanitizeUrl(renderStringify(unsafeUrl));
}
function ɵɵsanitizeResourceUrl(unsafeResourceUrl) {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedScriptURLFromStringBypass(sanitizer.sanitize(SecurityContext.RESOURCE_URL, unsafeResourceUrl) || "");
  }
  if (allowSanitizationBypassAndThrow(unsafeResourceUrl, "ResourceURL")) {
    return trustedScriptURLFromStringBypass(unwrapSafeValue(unsafeResourceUrl));
  }
  throw new RuntimeError(904, ngDevMode && `unsafe value used in a resource URL context (see ${XSS_SECURITY_URL})`);
}
function ɵɵsanitizeScript(unsafeScript) {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedScriptFromStringBypass(sanitizer.sanitize(SecurityContext.SCRIPT, unsafeScript) || "");
  }
  if (allowSanitizationBypassAndThrow(unsafeScript, "Script")) {
    return trustedScriptFromStringBypass(unwrapSafeValue(unsafeScript));
  }
  throw new RuntimeError(905, ngDevMode && "unsafe value used in a script context");
}
function ɵɵtrustConstantHtml(html) {
  if (ngDevMode && (!Array.isArray(html) || !Array.isArray(html.raw) || html.length !== 1)) {
    throw new Error(`Unexpected interpolation in trusted HTML constant: ${html.join("?")}`);
  }
  return trustedHTMLFromString(html[0]);
}
function ɵɵtrustConstantResourceUrl(url) {
  if (ngDevMode && (!Array.isArray(url) || !Array.isArray(url.raw) || url.length !== 1)) {
    throw new Error(`Unexpected interpolation in trusted URL constant: ${url.join("?")}`);
  }
  return trustedScriptURLFromString(url[0]);
}
var SRC_RESOURCE_TAGS = /* @__PURE__ */ new Set(["embed", "frame", "iframe", "media", "script"]);
var HREF_RESOURCE_TAGS = /* @__PURE__ */ new Set(["base", "link", "script"]);
function getUrlSanitizer(tag, prop) {
  const isResource = prop === "src" && SRC_RESOURCE_TAGS.has(tag) || prop === "href" && HREF_RESOURCE_TAGS.has(tag) || prop === "xlink:href" && tag === "script";
  return isResource ? ɵɵsanitizeResourceUrl : ɵɵsanitizeUrl;
}
function ɵɵsanitizeUrlOrResourceUrl(unsafeUrl, tag, prop) {
  return getUrlSanitizer(tag, prop)(unsafeUrl);
}
function validateAgainstEventProperties(name) {
  if (name.toLowerCase().startsWith("on")) {
    const errorMessage = `Binding to event property '${name}' is disallowed for security reasons, please use (${name.slice(2)})=...
If '${name}' is a directive input, make sure the directive is imported by the current module.`;
    throw new RuntimeError(306, errorMessage);
  }
}
function validateAgainstEventAttributes(name) {
  if (name.toLowerCase().startsWith("on")) {
    const errorMessage = `Binding to event attribute '${name}' is disallowed for security reasons, please use (${name.slice(2)})=...`;
    throw new RuntimeError(306, errorMessage);
  }
}
function getSanitizer() {
  const lView = getLView();
  return lView && lView[ENVIRONMENT].sanitizer;
}
var attributeName = /* @__PURE__ */ new Set(["attributename"]);
var SECURITY_SENSITIVE_ELEMENTS = {
  "iframe": /* @__PURE__ */ new Set(["sandbox", "allow", "allowfullscreen", "referrerpolicy", "csp", "fetchpriority"]),
  "animate": attributeName,
  "set": attributeName,
  "animatemotion": attributeName,
  "animatetransform": attributeName
};
function ɵɵvalidateAttribute(value, tagName, attributeName2) {
  const lowerCaseTagName = tagName.toLowerCase();
  const lowerCaseAttrName = attributeName2.toLowerCase();
  if (!SECURITY_SENSITIVE_ELEMENTS[lowerCaseTagName]?.has(lowerCaseAttrName)) {
    return value;
  }
  const tNode = getSelectedTNode();
  if (tNode.type !== 2) {
    return value;
  }
  const lView = getLView();
  if (lowerCaseTagName === "iframe") {
    const element = getNativeByTNode(tNode, lView);
    enforceIframeSecurity(element);
  }
  const errorMessage = ngDevMode && `Angular has detected that the \`${attributeName2}\` was applied as a binding to the <${tagName}> element${getTemplateLocationDetails(lView)}. For security reasons, the \`${attributeName2}\` can be set on the <${tagName}> element as a static attribute only. 
To fix this, switch the \`${attributeName2}\` binding to a static attribute in a template or in host bindings section.`;
  throw new RuntimeError(-910, errorMessage);
}
var NG_REFLECT_ATTRS_FLAG_DEFAULT = false;
var NG_REFLECT_ATTRS_FLAG = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "NG_REFLECT_FLAG" : "", {
  factory: () => NG_REFLECT_ATTRS_FLAG_DEFAULT
});
function provideNgReflectAttributes() {
  const providers = typeof ngDevMode === "undefined" || ngDevMode ? [{
    provide: NG_REFLECT_ATTRS_FLAG,
    useValue: true
  }] : [];
  return makeEnvironmentProviders(providers);
}
function normalizeDebugBindingName(name) {
  name = camelCaseToDashCase(name.replace(/[$@]/g, "_"));
  return `ng-reflect-${name}`;
}
var CAMEL_CASE_REGEXP = /([A-Z])/g;
function camelCaseToDashCase(input2) {
  return input2.replace(CAMEL_CASE_REGEXP, (...m) => "-" + m[1].toLowerCase());
}
function normalizeDebugBindingValue(value) {
  try {
    return value != null ? value.toString().slice(0, 30) : value;
  } catch (e) {
    return "[ERROR] Exception while trying to serialize the value";
  }
}
function ɵɵresolveWindow(element) {
  return element.ownerDocument.defaultView;
}
function ɵɵresolveDocument(element) {
  return element.ownerDocument;
}
function ɵɵresolveBody(element) {
  return element.ownerDocument.body;
}
var INTERPOLATION_DELIMITER = `�`;
function maybeUnwrapFn(value) {
  if (value instanceof Function) {
    return value();
  } else {
    return value;
  }
}
var VALUE_STRING_LENGTH_LIMIT = 200;
function assertStandaloneComponentType(type) {
  assertComponentDef(type);
  const componentDef = getComponentDef(type);
  if (!componentDef.standalone) {
    throw new RuntimeError(907, `The ${stringifyForError(type)} component is not marked as standalone, but Angular expects to have a standalone component here. Please make sure the ${stringifyForError(type)} component does not have the \`standalone: false\` flag in the decorator.`);
  }
}
function assertComponentDef(type) {
  if (!getComponentDef(type)) {
    throw new RuntimeError(906, `The ${stringifyForError(type)} is not an Angular component, make sure it has the \`@Component\` decorator.`);
  }
}
function throwMultipleComponentError(tNode, first, second) {
  throw new RuntimeError(-300, `Multiple components match node with tagname ${tNode.value}: ${stringifyForError(first)} and ${stringifyForError(second)}`);
}
function throwErrorIfNoChangesMode(creationMode, oldValue, currValue, propName, lView) {
  const hostComponentDef = getDeclarationComponentDef(lView);
  const componentClassName = hostComponentDef?.type?.name;
  const field = propName ? ` for '${propName}'` : "";
  let msg = `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value${field}: '${formatValue(oldValue)}'. Current value: '${formatValue(currValue)}'.${componentClassName ? ` Expression location: ${componentClassName} component` : ""}`;
  if (creationMode) {
    msg += ` It seems like the view has been created after its parent and its children have been dirty checked. Has it been created in a change detection hook?`;
  }
  throw new RuntimeError(-100, msg);
}
function formatValue(value) {
  let strValue = String(value);
  try {
    if (Array.isArray(value) || strValue === "[object Object]") {
      strValue = JSON.stringify(value);
    }
  } catch (error) {
  }
  return strValue.length > VALUE_STRING_LENGTH_LIMIT ? strValue.substring(0, VALUE_STRING_LENGTH_LIMIT) + "…" : strValue;
}
function constructDetailsForInterpolation(lView, rootIndex, expressionIndex, meta, changedValue) {
  const [propName, prefix, ...chunks] = meta.split(INTERPOLATION_DELIMITER);
  let oldValue = prefix, newValue = prefix;
  for (let i = 0; i < chunks.length; i++) {
    const slotIdx = rootIndex + i;
    oldValue += `${lView[slotIdx]}${chunks[i]}`;
    newValue += `${slotIdx === expressionIndex ? changedValue : lView[slotIdx]}${chunks[i]}`;
  }
  return {
    propName,
    oldValue,
    newValue
  };
}
function getExpressionChangedErrorDetails(lView, bindingIndex, oldValue, newValue) {
  const tData = lView[TVIEW].data;
  const metadata = tData[bindingIndex];
  if (typeof metadata === "string") {
    if (metadata.indexOf(INTERPOLATION_DELIMITER) > -1) {
      return constructDetailsForInterpolation(lView, bindingIndex, bindingIndex, metadata, newValue);
    }
    return {
      propName: metadata,
      oldValue,
      newValue
    };
  }
  if (metadata === null) {
    let idx = bindingIndex - 1;
    while (typeof tData[idx] !== "string" && tData[idx + 1] === null) {
      idx--;
    }
    const meta = tData[idx];
    if (typeof meta === "string") {
      const matches = meta.match(new RegExp(INTERPOLATION_DELIMITER, "g"));
      if (matches && matches.length - 1 > bindingIndex - idx) {
        return constructDetailsForInterpolation(lView, idx, bindingIndex, meta, newValue);
      }
    }
  }
  return {
    propName: void 0,
    oldValue,
    newValue
  };
}
function classIndexOf(className, classToSearch, startingIndex) {
  ngDevMode && assertNotEqual(classToSearch, "", 'can not look for "" string.');
  let end = className.length;
  while (true) {
    const foundIndex = className.indexOf(classToSearch, startingIndex);
    if (foundIndex === -1) return foundIndex;
    if (foundIndex === 0 || className.charCodeAt(foundIndex - 1) <= 32) {
      const length = classToSearch.length;
      if (foundIndex + length === end || className.charCodeAt(foundIndex + length) <= 32) {
        return foundIndex;
      }
    }
    startingIndex = foundIndex + 1;
  }
}
var NG_TEMPLATE_SELECTOR = "ng-template";
function isCssClassMatching(tNode, attrs, cssClassToMatch, isProjectionMode) {
  ngDevMode && assertEqual(cssClassToMatch, cssClassToMatch.toLowerCase(), "Class name expected to be lowercase.");
  let i = 0;
  if (isProjectionMode) {
    for (; i < attrs.length && typeof attrs[i] === "string"; i += 2) {
      if (attrs[i] === "class" && classIndexOf(attrs[i + 1].toLowerCase(), cssClassToMatch, 0) !== -1) {
        return true;
      }
    }
  } else if (isInlineTemplate(tNode)) {
    return false;
  }
  i = attrs.indexOf(1, i);
  if (i > -1) {
    let item;
    while (++i < attrs.length && typeof (item = attrs[i]) === "string") {
      if (item.toLowerCase() === cssClassToMatch) {
        return true;
      }
    }
  }
  return false;
}
function isInlineTemplate(tNode) {
  return tNode.type === 4 && tNode.value !== NG_TEMPLATE_SELECTOR;
}
function hasTagAndTypeMatch(tNode, currentSelector, isProjectionMode) {
  const tagNameToCompare = tNode.type === 4 && !isProjectionMode ? NG_TEMPLATE_SELECTOR : tNode.value;
  return currentSelector === tagNameToCompare;
}
function isNodeMatchingSelector(tNode, selector, isProjectionMode) {
  ngDevMode && assertDefined(selector[0], "Selector should have a tag name");
  let mode = 4;
  const nodeAttrs = tNode.attrs;
  const nameOnlyMarkerIdx = nodeAttrs !== null ? getNameOnlyMarkerIndex(nodeAttrs) : 0;
  let skipToNextSelector = false;
  for (let i = 0; i < selector.length; i++) {
    const current = selector[i];
    if (typeof current === "number") {
      if (!skipToNextSelector && !isPositive(mode) && !isPositive(current)) {
        return false;
      }
      if (skipToNextSelector && isPositive(current)) continue;
      skipToNextSelector = false;
      mode = current | mode & 1;
      continue;
    }
    if (skipToNextSelector) continue;
    if (mode & 4) {
      mode = 2 | mode & 1;
      if (current !== "" && !hasTagAndTypeMatch(tNode, current, isProjectionMode) || current === "" && selector.length === 1) {
        if (isPositive(mode)) return false;
        skipToNextSelector = true;
      }
    } else if (mode & 8) {
      if (nodeAttrs === null || !isCssClassMatching(tNode, nodeAttrs, current, isProjectionMode)) {
        if (isPositive(mode)) return false;
        skipToNextSelector = true;
      }
    } else {
      const selectorAttrValue = selector[++i];
      const attrIndexInNode = findAttrIndexInNode(current, nodeAttrs, isInlineTemplate(tNode), isProjectionMode);
      if (attrIndexInNode === -1) {
        if (isPositive(mode)) return false;
        skipToNextSelector = true;
        continue;
      }
      if (selectorAttrValue !== "") {
        let nodeAttrValue;
        if (attrIndexInNode > nameOnlyMarkerIdx) {
          nodeAttrValue = "";
        } else {
          ngDevMode && assertNotEqual(nodeAttrs[attrIndexInNode], 0, "We do not match directives on namespaced attributes");
          nodeAttrValue = nodeAttrs[attrIndexInNode + 1].toLowerCase();
        }
        if (mode & 2 && selectorAttrValue !== nodeAttrValue) {
          if (isPositive(mode)) return false;
          skipToNextSelector = true;
        }
      }
    }
  }
  return isPositive(mode) || skipToNextSelector;
}
function isPositive(mode) {
  return (mode & 1) === 0;
}
function findAttrIndexInNode(name, attrs, isInlineTemplate2, isProjectionMode) {
  if (attrs === null) return -1;
  let i = 0;
  if (isProjectionMode || !isInlineTemplate2) {
    let bindingsMode = false;
    while (i < attrs.length) {
      const maybeAttrName = attrs[i];
      if (maybeAttrName === name) {
        return i;
      } else if (maybeAttrName === 3 || maybeAttrName === 6) {
        bindingsMode = true;
      } else if (maybeAttrName === 1 || maybeAttrName === 2) {
        let value = attrs[++i];
        while (typeof value === "string") {
          value = attrs[++i];
        }
        continue;
      } else if (maybeAttrName === 4) {
        break;
      } else if (maybeAttrName === 0) {
        i += 4;
        continue;
      }
      i += bindingsMode ? 1 : 2;
    }
    return -1;
  } else {
    return matchTemplateAttribute(attrs, name);
  }
}
function isNodeMatchingSelectorList(tNode, selector, isProjectionMode = false) {
  for (let i = 0; i < selector.length; i++) {
    if (isNodeMatchingSelector(tNode, selector[i], isProjectionMode)) {
      return true;
    }
  }
  return false;
}
function getProjectAsAttrValue(tNode) {
  const nodeAttrs = tNode.attrs;
  if (nodeAttrs != null) {
    const ngProjectAsAttrIdx = nodeAttrs.indexOf(5);
    if ((ngProjectAsAttrIdx & 1) === 0) {
      return nodeAttrs[ngProjectAsAttrIdx + 1];
    }
  }
  return null;
}
function getNameOnlyMarkerIndex(nodeAttrs) {
  for (let i = 0; i < nodeAttrs.length; i++) {
    const nodeAttr = nodeAttrs[i];
    if (isNameOnlyAttributeMarker(nodeAttr)) {
      return i;
    }
  }
  return nodeAttrs.length;
}
function matchTemplateAttribute(attrs, name) {
  let i = attrs.indexOf(4);
  if (i > -1) {
    i++;
    while (i < attrs.length) {
      const attr = attrs[i];
      if (typeof attr === "number") return -1;
      if (attr === name) return i;
      i++;
    }
  }
  return -1;
}
function isSelectorInSelectorList(selector, list) {
  selectorListLoop: for (let i = 0; i < list.length; i++) {
    const currentSelectorInList = list[i];
    if (selector.length !== currentSelectorInList.length) {
      continue;
    }
    for (let j = 0; j < selector.length; j++) {
      if (selector[j] !== currentSelectorInList[j]) {
        continue selectorListLoop;
      }
    }
    return true;
  }
  return false;
}
function maybeWrapInNotSelector(isNegativeMode, chunk) {
  return isNegativeMode ? ":not(" + chunk.trim() + ")" : chunk;
}
function stringifyCSSSelector(selector) {
  let result = selector[0];
  let i = 1;
  let mode = 2;
  let currentChunk = "";
  let isNegativeMode = false;
  while (i < selector.length) {
    let valueOrMarker = selector[i];
    if (typeof valueOrMarker === "string") {
      if (mode & 2) {
        const attrValue = selector[++i];
        currentChunk += "[" + valueOrMarker + (attrValue.length > 0 ? '="' + attrValue + '"' : "") + "]";
      } else if (mode & 8) {
        currentChunk += "." + valueOrMarker;
      } else if (mode & 4) {
        currentChunk += " " + valueOrMarker;
      }
    } else {
      if (currentChunk !== "" && !isPositive(valueOrMarker)) {
        result += maybeWrapInNotSelector(isNegativeMode, currentChunk);
        currentChunk = "";
      }
      mode = valueOrMarker;
      isNegativeMode = isNegativeMode || !isPositive(mode);
    }
    i++;
  }
  if (currentChunk !== "") {
    result += maybeWrapInNotSelector(isNegativeMode, currentChunk);
  }
  return result;
}
function stringifyCSSSelectorList(selectorList) {
  return selectorList.map(stringifyCSSSelector).join(",");
}
function extractAttrsAndClassesFromSelector(selector) {
  const attrs = [];
  const classes = [];
  let i = 1;
  let mode = 2;
  while (i < selector.length) {
    let valueOrMarker = selector[i];
    if (typeof valueOrMarker === "string") {
      if (mode === 2) {
        if (valueOrMarker !== "") {
          attrs.push(valueOrMarker, selector[++i]);
        }
      } else if (mode === 8) {
        classes.push(valueOrMarker);
      }
    } else {
      if (!isPositive(mode)) break;
      mode = valueOrMarker;
    }
    i++;
  }
  if (classes.length) {
    attrs.push(1, ...classes);
  }
  return attrs;
}
var NO_CHANGE = typeof ngDevMode === "undefined" || ngDevMode ? {
  __brand__: "NO_CHANGE"
} : {};
function createTView(type, declTNode, templateFn, decls, vars, directives, pipes, viewQuery, schemas, constsOrFactory, ssrId) {
  const bindingStartIndex = HEADER_OFFSET + decls;
  const initialViewLength = bindingStartIndex + vars;
  const blueprint = createViewBlueprint(bindingStartIndex, initialViewLength);
  const consts = typeof constsOrFactory === "function" ? constsOrFactory() : constsOrFactory;
  const tView = blueprint[TVIEW] = {
    type,
    blueprint,
    template: templateFn,
    queries: null,
    viewQuery,
    declTNode,
    data: blueprint.slice().fill(null, bindingStartIndex),
    bindingStartIndex,
    expandoStartIndex: initialViewLength,
    hostBindingOpCodes: null,
    firstCreatePass: true,
    firstUpdatePass: true,
    staticViewQueries: false,
    staticContentQueries: false,
    preOrderHooks: null,
    preOrderCheckHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null,
    cleanup: null,
    contentQueries: null,
    components: null,
    directiveRegistry: typeof directives === "function" ? directives() : directives,
    pipeRegistry: typeof pipes === "function" ? pipes() : pipes,
    firstChild: null,
    schemas,
    consts,
    incompleteFirstPass: false,
    ssrId
  };
  if (ngDevMode) {
    Object.seal(tView);
  }
  return tView;
}
function createViewBlueprint(bindingStartIndex, initialViewLength) {
  const blueprint = [];
  for (let i = 0; i < initialViewLength; i++) {
    blueprint.push(i < bindingStartIndex ? null : NO_CHANGE);
  }
  return blueprint;
}
function getOrCreateComponentTView(def) {
  const tView = def.tView;
  if (tView === null || tView.incompleteFirstPass) {
    const declTNode = null;
    return def.tView = createTView(1, declTNode, def.template, def.decls, def.vars, def.directiveDefs, def.pipeDefs, def.viewQuery, def.schemas, def.consts, def.id);
  }
  return tView;
}
function createLView(parentLView, tView, context, flags, host, tHostNode, environment, renderer, injector, embeddedViewInjector, hydrationInfo) {
  const lView = tView.blueprint.slice();
  lView[HOST] = host;
  lView[FLAGS] = flags | 4 | 128 | 8 | 64 | 1024;
  if (embeddedViewInjector !== null || parentLView && parentLView[FLAGS] & 2048) {
    lView[FLAGS] |= 2048;
  }
  resetPreOrderHookFlags(lView);
  ngDevMode && tView.declTNode && parentLView && assertTNodeForLView(tView.declTNode, parentLView);
  lView[PARENT] = lView[DECLARATION_VIEW] = parentLView;
  lView[CONTEXT] = context;
  lView[ENVIRONMENT] = environment || parentLView && parentLView[ENVIRONMENT];
  ngDevMode && assertDefined(lView[ENVIRONMENT], "LViewEnvironment is required");
  lView[RENDERER] = renderer || parentLView && parentLView[RENDERER];
  ngDevMode && assertDefined(lView[RENDERER], "Renderer is required");
  lView[INJECTOR] = injector || parentLView && parentLView[INJECTOR] || null;
  lView[T_HOST] = tHostNode;
  lView[ID] = getUniqueLViewId();
  lView[HYDRATION] = hydrationInfo;
  lView[EMBEDDED_VIEW_INJECTOR] = embeddedViewInjector;
  ngDevMode && assertEqual(tView.type == 2 ? parentLView !== null : true, true, "Embedded views must have parentLView");
  lView[DECLARATION_COMPONENT_VIEW] = tView.type == 2 ? parentLView[DECLARATION_COMPONENT_VIEW] : lView;
  return lView;
}
function createComponentLView(lView, hostTNode, def) {
  const native = getNativeByTNode(hostTNode, lView);
  const tView = getOrCreateComponentTView(def);
  const rendererFactory = lView[ENVIRONMENT].rendererFactory;
  const componentView = addToEndOfViewTree(lView, createLView(lView, tView, null, getInitialLViewFlagsFromDef(def), native, hostTNode, null, rendererFactory.createRenderer(native, def), null, null, null));
  return lView[hostTNode.index] = componentView;
}
function getInitialLViewFlagsFromDef(def) {
  let flags = 16;
  if (def.signals) {
    flags = 4096;
  } else if (def.onPush) {
    flags = 64;
  }
  return flags;
}
function allocExpando(tView, lView, numSlotsToAlloc, initialValue) {
  if (numSlotsToAlloc === 0) return -1;
  if (ngDevMode) {
    assertFirstCreatePass(tView);
    assertSame(tView, lView[TVIEW], "`LView` must be associated with `TView`!");
    assertEqual(tView.data.length, lView.length, "Expecting LView to be same size as TView");
    assertEqual(tView.data.length, tView.blueprint.length, "Expecting Blueprint to be same size as TView");
    assertFirstUpdatePass(tView);
  }
  const allocIdx = lView.length;
  for (let i = 0; i < numSlotsToAlloc; i++) {
    lView.push(initialValue);
    tView.blueprint.push(initialValue);
    tView.data.push(null);
  }
  return allocIdx;
}
function addToEndOfViewTree(lView, lViewOrLContainer) {
  if (lView[CHILD_HEAD]) {
    lView[CHILD_TAIL][NEXT] = lViewOrLContainer;
  } else {
    lView[CHILD_HEAD] = lViewOrLContainer;
  }
  lView[CHILD_TAIL] = lViewOrLContainer;
  return lViewOrLContainer;
}
function ɵɵadvance(delta = 1) {
  ngDevMode && assertGreaterThan(delta, 0, "Can only advance forward");
  selectIndexInternal(getTView(), getLView(), getSelectedIndex() + delta, !!ngDevMode && isInCheckNoChangesMode());
}
function selectIndexInternal(tView, lView, index, checkNoChangesMode) {
  ngDevMode && assertIndexInDeclRange(lView[TVIEW], index);
  if (!checkNoChangesMode) {
    const hooksInitPhaseCompleted = (lView[FLAGS] & 3) === 3;
    if (hooksInitPhaseCompleted) {
      const preOrderCheckHooks = tView.preOrderCheckHooks;
      if (preOrderCheckHooks !== null) {
        executeCheckHooks(lView, preOrderCheckHooks, index);
      }
    } else {
      const preOrderHooks = tView.preOrderHooks;
      if (preOrderHooks !== null) {
        executeInitAndCheckHooks(lView, preOrderHooks, 0, index);
      }
    }
  }
  setSelectedIndex(index);
}
var InputFlags;
(function(InputFlags2) {
  InputFlags2[InputFlags2["None"] = 0] = "None";
  InputFlags2[InputFlags2["SignalBased"] = 1] = "SignalBased";
  InputFlags2[InputFlags2["HasDecoratorInputTransform"] = 2] = "HasDecoratorInputTransform";
})(InputFlags || (InputFlags = {}));
function writeToDirectiveInput(def, instance, publicName, value) {
  const prevConsumer = setActiveConsumer(null);
  try {
    if (ngDevMode) {
      if (!def.inputs.hasOwnProperty(publicName)) {
        throw new Error(`ASSERTION ERROR: Directive ${def.type.name} does not have an input with a public name of "${publicName}"`);
      }
      if (instance instanceof NodeInjectorFactory) {
        throw new Error(`ASSERTION ERROR: Cannot write input to factory for type ${def.type.name}. Directive has not been created yet.`);
      }
    }
    const [privateName, flags, transform] = def.inputs[publicName];
    let inputSignalNode = null;
    if ((flags & InputFlags.SignalBased) !== 0) {
      const field = instance[privateName];
      inputSignalNode = field[SIGNAL];
    }
    if (inputSignalNode !== null && inputSignalNode.transformFn !== void 0) {
      value = inputSignalNode.transformFn(value);
    } else if (transform !== null) {
      value = transform.call(instance, value);
    }
    if (def.setInput !== null) {
      def.setInput(instance, inputSignalNode, value, publicName, privateName);
    } else {
      applyValueToInputField(instance, inputSignalNode, privateName, value);
    }
  } finally {
    setActiveConsumer(prevConsumer);
  }
}
var RendererStyleFlags2;
(function(RendererStyleFlags22) {
  RendererStyleFlags22[RendererStyleFlags22["Important"] = 1] = "Important";
  RendererStyleFlags22[RendererStyleFlags22["DashCase"] = 2] = "DashCase";
})(RendererStyleFlags2 || (RendererStyleFlags2 = {}));
var _icuContainerIterate;
function icuContainerIterate(tIcuContainerNode, lView) {
  return _icuContainerIterate(tIcuContainerNode, lView);
}
function ensureIcuContainerVisitorLoaded(loader) {
  if (_icuContainerIterate === void 0) {
    _icuContainerIterate = loader();
  }
}
function parseCssTimeUnitsToMs(value) {
  if (!value) return 0;
  const multiplier = value.toLowerCase().indexOf("ms") > -1 ? 1 : 1e3;
  return parseFloat(value) * multiplier;
}
function parseCssPropertyValue(computedStyle, name) {
  const value = computedStyle.getPropertyValue(name);
  return value.split(",").map((part) => part.trim());
}
function getLongestComputedTransition(computedStyle) {
  const transitionedProperties = parseCssPropertyValue(computedStyle, "transition-property");
  const rawDurations = parseCssPropertyValue(computedStyle, "transition-duration");
  const rawDelays = parseCssPropertyValue(computedStyle, "transition-delay");
  const longest = {
    propertyName: "",
    duration: 0,
    animationName: void 0
  };
  for (let i = 0; i < transitionedProperties.length; i++) {
    const duration = parseCssTimeUnitsToMs(rawDelays[i]) + parseCssTimeUnitsToMs(rawDurations[i]);
    if (duration > longest.duration) {
      longest.propertyName = transitionedProperties[i];
      longest.duration = duration;
    }
  }
  return longest;
}
function getLongestComputedAnimation(computedStyle) {
  const rawNames = parseCssPropertyValue(computedStyle, "animation-name");
  const rawDelays = parseCssPropertyValue(computedStyle, "animation-delay");
  const rawDurations = parseCssPropertyValue(computedStyle, "animation-duration");
  const longest = {
    animationName: "",
    propertyName: void 0,
    duration: 0
  };
  for (let i = 0; i < rawNames.length; i++) {
    const duration = parseCssTimeUnitsToMs(rawDelays[i]) + parseCssTimeUnitsToMs(rawDurations[i]);
    if (duration > longest.duration) {
      longest.animationName = rawNames[i];
      longest.duration = duration;
    }
  }
  return longest;
}
function isShorterThanExistingAnimation(existing, longest) {
  return existing !== void 0 && existing.duration > longest.duration;
}
function longestExists(longest) {
  return (longest.animationName != void 0 || longest.propertyName != void 0) && longest.duration > 0;
}
function determineLongestAnimationFromComputedStyles(el, animationsMap) {
  const computedStyle = getComputedStyle(el);
  const longestAnimation = getLongestComputedAnimation(computedStyle);
  const longestTransition = getLongestComputedTransition(computedStyle);
  const longest = longestAnimation.duration > longestTransition.duration ? longestAnimation : longestTransition;
  if (isShorterThanExistingAnimation(animationsMap.get(el), longest)) return;
  if (longestExists(longest)) {
    animationsMap.set(el, longest);
  }
}
function determineLongestAnimation(el, animationsMap, areAnimationSupported2) {
  if (!areAnimationSupported2) return;
  const animations = el.getAnimations();
  return animations.length === 0 ? determineLongestAnimationFromComputedStyles(el, animationsMap) : determineLongestAnimationFromElementAnimations(el, animationsMap, animations);
}
function determineLongestAnimationFromElementAnimations(el, animationsMap, animations) {
  let longest = {
    animationName: void 0,
    propertyName: void 0,
    duration: 0
  };
  for (const animation of animations) {
    const timing = animation.effect?.getTiming();
    const animDuration = typeof timing?.duration === "number" ? timing.duration : 0;
    let duration = (timing?.delay ?? 0) + animDuration;
    let propertyName;
    let animationName;
    if (animation.animationName) {
      animationName = animation.animationName;
    } else {
      propertyName = animation.transitionProperty;
    }
    if (duration >= longest.duration) {
      longest = {
        animationName,
        propertyName,
        duration
      };
    }
  }
  if (isShorterThanExistingAnimation(animationsMap.get(el), longest)) return;
  if (longestExists(longest)) {
    animationsMap.set(el, longest);
  }
}
var allLeavingAnimations = /* @__PURE__ */ new Set();
var TracingAction;
(function(TracingAction2) {
  TracingAction2[TracingAction2["CHANGE_DETECTION"] = 0] = "CHANGE_DETECTION";
  TracingAction2[TracingAction2["AFTER_NEXT_RENDER"] = 1] = "AFTER_NEXT_RENDER";
})(TracingAction || (TracingAction = {}));
var TracingService = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "TracingService" : "");
var markedFeatures = /* @__PURE__ */ new Set();
function performanceMarkFeature(feature) {
  if (markedFeatures.has(feature)) {
    return;
  }
  markedFeatures.add(feature);
  performance?.mark?.("mark_feature_usage", {
    detail: {
      feature
    }
  });
}
var AfterRenderManager = class _AfterRenderManager {
  impl = null;
  execute() {
    this.impl?.execute();
  }
  static ɵprov = ɵɵdefineInjectable({
    token: _AfterRenderManager,
    providedIn: "root",
    factory: () => new _AfterRenderManager()
  });
};
var AFTER_RENDER_PHASES = /* @__PURE__ */ (() => [0, 1, 2, 3])();
var AfterRenderImpl = class _AfterRenderImpl {
  ngZone = inject(NgZone);
  scheduler = inject(ChangeDetectionScheduler);
  errorHandler = inject(ErrorHandler, {
    optional: true
  });
  sequences = /* @__PURE__ */ new Set();
  deferredRegistrations = /* @__PURE__ */ new Set();
  executing = false;
  constructor() {
    inject(TracingService, {
      optional: true
    });
  }
  execute() {
    const hasSequencesToExecute = this.sequences.size > 0;
    if (hasSequencesToExecute) {
      profiler(ProfilerEvent.AfterRenderHooksStart);
    }
    this.executing = true;
    for (const phase of AFTER_RENDER_PHASES) {
      for (const sequence of this.sequences) {
        if (sequence.erroredOrDestroyed || !sequence.hooks[phase]) {
          continue;
        }
        try {
          sequence.pipelinedValue = this.ngZone.runOutsideAngular(() => this.maybeTrace(() => {
            const hookFn = sequence.hooks[phase];
            const value = hookFn(sequence.pipelinedValue);
            return value;
          }, sequence.snapshot));
        } catch (err) {
          sequence.erroredOrDestroyed = true;
          this.errorHandler?.handleError(err);
        }
      }
    }
    this.executing = false;
    for (const sequence of this.sequences) {
      sequence.afterRun();
      if (sequence.once) {
        this.sequences.delete(sequence);
        sequence.destroy();
      }
    }
    for (const sequence of this.deferredRegistrations) {
      this.sequences.add(sequence);
    }
    if (this.deferredRegistrations.size > 0) {
      this.scheduler.notify(7);
    }
    this.deferredRegistrations.clear();
    if (hasSequencesToExecute) {
      profiler(ProfilerEvent.AfterRenderHooksEnd);
    }
  }
  register(sequence) {
    const {
      view
    } = sequence;
    if (view !== void 0) {
      (view[AFTER_RENDER_SEQUENCES_TO_ADD] ??= []).push(sequence);
      markAncestorsForTraversal(view);
      view[FLAGS] |= 8192;
    } else if (!this.executing) {
      this.addSequence(sequence);
    } else {
      this.deferredRegistrations.add(sequence);
    }
  }
  addSequence(sequence) {
    this.sequences.add(sequence);
    this.scheduler.notify(7);
  }
  unregister(sequence) {
    if (this.executing && this.sequences.has(sequence)) {
      sequence.erroredOrDestroyed = true;
      sequence.pipelinedValue = void 0;
      sequence.once = true;
    } else {
      this.sequences.delete(sequence);
      this.deferredRegistrations.delete(sequence);
    }
  }
  maybeTrace(fn, snapshot) {
    return snapshot ? snapshot.run(TracingAction.AFTER_NEXT_RENDER, fn) : fn();
  }
  static ɵprov = ɵɵdefineInjectable({
    token: _AfterRenderImpl,
    providedIn: "root",
    factory: () => new _AfterRenderImpl()
  });
};
var AfterRenderSequence = class {
  impl;
  hooks;
  view;
  once;
  snapshot;
  erroredOrDestroyed = false;
  pipelinedValue = void 0;
  unregisterOnDestroy;
  constructor(impl, hooks, view, once, destroyRef, snapshot = null) {
    this.impl = impl;
    this.hooks = hooks;
    this.view = view;
    this.once = once;
    this.snapshot = snapshot;
    this.unregisterOnDestroy = destroyRef?.onDestroy(() => this.destroy());
  }
  afterRun() {
    this.erroredOrDestroyed = false;
    this.pipelinedValue = void 0;
    this.snapshot?.dispose();
    this.snapshot = null;
  }
  destroy() {
    this.impl.unregister(this);
    this.unregisterOnDestroy?.();
    const scheduled = this.view?.[AFTER_RENDER_SEQUENCES_TO_ADD];
    if (scheduled) {
      this.view[AFTER_RENDER_SEQUENCES_TO_ADD] = scheduled.filter((s) => s !== this);
    }
  }
};
function afterEveryRender(callbackOrSpec, options) {
  ngDevMode && assertNotInReactiveContext(afterEveryRender, "Call `afterEveryRender` outside of a reactive context. For example, schedule the render callback inside the component constructor`.");
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(afterEveryRender);
  }
  const injector = options?.injector ?? inject(Injector);
  if (false) {
    return NOOP_AFTER_RENDER_REF;
  }
  performanceMarkFeature("NgAfterRender");
  return afterEveryRenderImpl(callbackOrSpec, injector, options, false);
}
function afterNextRender(callbackOrSpec, options) {
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(afterNextRender);
  }
  const injector = options?.injector ?? inject(Injector);
  if (false) {
    return NOOP_AFTER_RENDER_REF;
  }
  performanceMarkFeature("NgAfterNextRender");
  return afterEveryRenderImpl(callbackOrSpec, injector, options, true);
}
function getHooks(callbackOrSpec) {
  if (callbackOrSpec instanceof Function) {
    return [void 0, void 0, callbackOrSpec, void 0];
  } else {
    return [callbackOrSpec.earlyRead, callbackOrSpec.write, callbackOrSpec.mixedReadWrite, callbackOrSpec.read];
  }
}
function afterEveryRenderImpl(callbackOrSpec, injector, options, once) {
  const manager = injector.get(AfterRenderManager);
  manager.impl ??= injector.get(AfterRenderImpl);
  const tracing = injector.get(TracingService, null, {
    optional: true
  });
  const destroyRef = options?.manualCleanup !== true ? injector.get(DestroyRef) : null;
  const viewContext = injector.get(ViewContext, null, {
    optional: true
  });
  const sequence = new AfterRenderSequence(manager.impl, getHooks(callbackOrSpec), viewContext?.view, once, destroyRef, tracing?.snapshot(null));
  manager.impl.register(sequence);
  return sequence;
}
var ANIMATION_QUEUE = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "AnimationQueue" : "", {
  factory: () => {
    return {
      queue: /* @__PURE__ */ new Set(),
      isScheduled: false,
      scheduler: null,
      injector: inject(EnvironmentInjector)
    };
  }
});
function addToAnimationQueue(injector, animationFns, animationData) {
  const animationQueue = injector.get(ANIMATION_QUEUE);
  if (Array.isArray(animationFns)) {
    for (const animateFn of animationFns) {
      animationQueue.queue.add(animateFn);
      animationData?.detachedLeaveAnimationFns?.push(animateFn);
    }
  } else {
    animationQueue.queue.add(animationFns);
    animationData?.detachedLeaveAnimationFns?.push(animationFns);
  }
  animationQueue.scheduler && animationQueue.scheduler(injector);
}
function removeFromAnimationQueue(injector, animationData) {
  const animationQueue = injector.get(ANIMATION_QUEUE);
  if (animationData.detachedLeaveAnimationFns) {
    for (const animationFn of animationData.detachedLeaveAnimationFns) {
      animationQueue.queue.delete(animationFn);
    }
    animationData.detachedLeaveAnimationFns = void 0;
  }
}
function scheduleAnimationQueue(injector) {
  const animationQueue = injector.get(ANIMATION_QUEUE);
  if (!animationQueue.isScheduled) {
    afterNextRender(() => {
      animationQueue.isScheduled = false;
      for (let animateFn of animationQueue.queue) {
        animateFn();
      }
      animationQueue.queue.clear();
    }, {
      injector: animationQueue.injector
    });
    animationQueue.isScheduled = true;
  }
}
function initializeAnimationQueueScheduler(injector) {
  const animationQueue = injector.get(ANIMATION_QUEUE);
  animationQueue.scheduler = scheduleAnimationQueue;
  animationQueue.scheduler(injector);
}
function queueEnterAnimations(injector, enterAnimations) {
  for (const [_, nodeAnimations] of enterAnimations) {
    addToAnimationQueue(injector, nodeAnimations.animateFns);
  }
}
function removeAnimationsFromQueue(injector, animationFns) {
  const animationQueue = injector.get(ANIMATION_QUEUE);
  if (Array.isArray(animationFns)) {
    for (const animateFn of animationFns) {
      animationQueue.queue.delete(animateFn);
    }
  } else {
    animationQueue.queue.delete(animationFns);
  }
}
function maybeQueueEnterAnimation(parentLView, parent, tNode, injector) {
  const enterAnimations = parentLView?.[ANIMATIONS]?.enter;
  if (parent !== null && enterAnimations && enterAnimations.has(tNode.index)) {
    queueEnterAnimations(injector, enterAnimations);
  }
}
function applyToElementOrContainer(action, renderer, injector, parent, lNodeToHandle, tNode, beforeNode, parentLView) {
  if (lNodeToHandle != null) {
    let lContainer;
    let isComponent2 = false;
    if (isLContainer(lNodeToHandle)) {
      lContainer = lNodeToHandle;
    } else if (isLView(lNodeToHandle)) {
      isComponent2 = true;
      ngDevMode && assertDefined(lNodeToHandle[HOST], "HOST must be defined for a component LView");
      lNodeToHandle = lNodeToHandle[HOST];
    }
    const rNode = unwrapRNode(lNodeToHandle);
    if (action === 0 && parent !== null) {
      maybeQueueEnterAnimation(parentLView, parent, tNode, injector);
      if (beforeNode == null) {
        nativeAppendChild(renderer, parent, rNode);
      } else {
        nativeInsertBefore(renderer, parent, rNode, beforeNode || null, true);
      }
    } else if (action === 1 && parent !== null) {
      maybeQueueEnterAnimation(parentLView, parent, tNode, injector);
      nativeInsertBefore(renderer, parent, rNode, beforeNode || null, true);
    } else if (action === 2) {
      runLeaveAnimationsWithCallback(parentLView, tNode, injector, (nodeHasLeaveAnimations) => {
        nativeRemoveNode(renderer, rNode, isComponent2, nodeHasLeaveAnimations);
      });
    } else if (action === 3) {
      runLeaveAnimationsWithCallback(parentLView, tNode, injector, () => {
        renderer.destroyNode(rNode);
      });
    }
    if (lContainer != null) {
      applyContainer(renderer, action, injector, lContainer, tNode, parent, beforeNode);
    }
  }
}
function removeViewFromDOM(tView, lView) {
  detachViewFromDOM(tView, lView);
  lView[HOST] = null;
  lView[T_HOST] = null;
}
function addViewToDOM(tView, parentTNode, renderer, lView, parentNativeNode, beforeNode) {
  lView[HOST] = parentNativeNode;
  lView[T_HOST] = parentTNode;
  applyView(tView, lView, renderer, 1, parentNativeNode, beforeNode);
}
function detachViewFromDOM(tView, lView) {
  lView[ENVIRONMENT].changeDetectionScheduler?.notify(9);
  applyView(tView, lView, lView[RENDERER], 2, null, null);
}
function destroyViewTree(rootView) {
  let lViewOrLContainer = rootView[CHILD_HEAD];
  if (!lViewOrLContainer) {
    return cleanUpView(rootView[TVIEW], rootView);
  }
  while (lViewOrLContainer) {
    let next = null;
    if (isLView(lViewOrLContainer)) {
      next = lViewOrLContainer[CHILD_HEAD];
    } else {
      ngDevMode && assertLContainer(lViewOrLContainer);
      const firstView = lViewOrLContainer[CONTAINER_HEADER_OFFSET];
      if (firstView) next = firstView;
    }
    if (!next) {
      while (lViewOrLContainer && !lViewOrLContainer[NEXT] && lViewOrLContainer !== rootView) {
        if (isLView(lViewOrLContainer)) {
          cleanUpView(lViewOrLContainer[TVIEW], lViewOrLContainer);
        }
        lViewOrLContainer = lViewOrLContainer[PARENT];
      }
      if (lViewOrLContainer === null) lViewOrLContainer = rootView;
      if (isLView(lViewOrLContainer)) {
        cleanUpView(lViewOrLContainer[TVIEW], lViewOrLContainer);
      }
      next = lViewOrLContainer && lViewOrLContainer[NEXT];
    }
    lViewOrLContainer = next;
  }
}
function detachMovedView(declarationContainer, lView) {
  ngDevMode && assertLContainer(declarationContainer);
  ngDevMode && assertDefined(declarationContainer[MOVED_VIEWS], "A projected view should belong to a non-empty projected views collection");
  const movedViews = declarationContainer[MOVED_VIEWS];
  const declarationViewIndex = movedViews.indexOf(lView);
  movedViews.splice(declarationViewIndex, 1);
}
function destroyLView(tView, lView) {
  if (isDestroyed(lView)) {
    return;
  }
  const renderer = lView[RENDERER];
  if (renderer.destroyNode) {
    applyView(tView, lView, renderer, 3, null, null);
  }
  destroyViewTree(lView);
}
function cleanUpView(tView, lView) {
  if (isDestroyed(lView)) {
    return;
  }
  const prevConsumer = setActiveConsumer(null);
  try {
    lView[FLAGS] &= ~128;
    lView[FLAGS] |= 256;
    lView[REACTIVE_TEMPLATE_CONSUMER] && consumerDestroy(lView[REACTIVE_TEMPLATE_CONSUMER]);
    executeOnDestroys(tView, lView);
    processCleanups(tView, lView);
    if (lView[TVIEW].type === 1) {
      lView[RENDERER].destroy();
    }
    const declarationContainer = lView[DECLARATION_LCONTAINER];
    if (declarationContainer !== null && isLContainer(lView[PARENT])) {
      if (declarationContainer !== lView[PARENT]) {
        detachMovedView(declarationContainer, lView);
      }
      const lQueries = lView[QUERIES];
      if (lQueries !== null) {
        lQueries.detachView(tView);
      }
    }
    unregisterLView(lView);
  } finally {
    setActiveConsumer(prevConsumer);
  }
}
function runLeaveAnimationsWithCallback(lView, tNode, injector, callback) {
  const animations = lView?.[ANIMATIONS];
  if (animations?.enter?.has(tNode.index)) {
    removeAnimationsFromQueue(injector, animations.enter.get(tNode.index).animateFns);
  }
  if (animations == null || animations.leave == void 0 || !animations.leave.has(tNode.index)) return callback(false);
  if (lView) allLeavingAnimations.add(lView[ID]);
  addToAnimationQueue(injector, () => {
    if (animations.leave && animations.leave.has(tNode.index)) {
      const leaveAnimationMap = animations.leave;
      const leaveAnimations = leaveAnimationMap.get(tNode.index);
      const runningAnimations = [];
      if (leaveAnimations) {
        for (let index = 0; index < leaveAnimations.animateFns.length; index++) {
          const animationFn = leaveAnimations.animateFns[index];
          const {
            promise
          } = animationFn();
          runningAnimations.push(promise);
        }
        animations.detachedLeaveAnimationFns = void 0;
      }
      animations.running = Promise.allSettled(runningAnimations);
      runAfterLeaveAnimations(lView, callback);
    } else {
      if (lView) allLeavingAnimations.delete(lView[ID]);
      callback(false);
    }
  }, animations);
}
function runAfterLeaveAnimations(lView, callback) {
  const runningAnimations = lView[ANIMATIONS]?.running;
  if (runningAnimations) {
    runningAnimations.then(() => {
      lView[ANIMATIONS].running = void 0;
      allLeavingAnimations.delete(lView[ID]);
      callback(true);
    });
    return;
  }
  callback(false);
}
function processCleanups(tView, lView) {
  ngDevMode && assertNotReactive(processCleanups.name);
  const tCleanup = tView.cleanup;
  const lCleanup = lView[CLEANUP];
  if (tCleanup !== null) {
    for (let i = 0; i < tCleanup.length - 1; i += 2) {
      if (typeof tCleanup[i] === "string") {
        const targetIdx = tCleanup[i + 3];
        ngDevMode && assertNumber(targetIdx, "cleanup target must be a number");
        if (targetIdx >= 0) {
          lCleanup[targetIdx]();
        } else {
          lCleanup[-targetIdx].unsubscribe();
        }
        i += 2;
      } else {
        const context = lCleanup[tCleanup[i + 1]];
        tCleanup[i].call(context);
      }
    }
  }
  if (lCleanup !== null) {
    lView[CLEANUP] = null;
  }
  const destroyHooks = lView[ON_DESTROY_HOOKS];
  if (destroyHooks !== null) {
    lView[ON_DESTROY_HOOKS] = null;
    for (let i = 0; i < destroyHooks.length; i++) {
      const destroyHooksFn = destroyHooks[i];
      ngDevMode && assertFunction(destroyHooksFn, "Expecting destroy hook to be a function.");
      destroyHooksFn();
    }
  }
  const effects = lView[EFFECTS];
  if (effects !== null) {
    lView[EFFECTS] = null;
    for (const effect2 of effects) {
      effect2.destroy();
    }
  }
}
function executeOnDestroys(tView, lView) {
  ngDevMode && assertNotReactive(executeOnDestroys.name);
  let destroyHooks;
  if (tView != null && (destroyHooks = tView.destroyHooks) != null) {
    for (let i = 0; i < destroyHooks.length; i += 2) {
      const context = lView[destroyHooks[i]];
      if (!(context instanceof NodeInjectorFactory)) {
        const toCall = destroyHooks[i + 1];
        if (Array.isArray(toCall)) {
          for (let j = 0; j < toCall.length; j += 2) {
            const callContext = context[toCall[j]];
            const hook = toCall[j + 1];
            profiler(ProfilerEvent.LifecycleHookStart, callContext, hook);
            try {
              hook.call(callContext);
            } finally {
              profiler(ProfilerEvent.LifecycleHookEnd, callContext, hook);
            }
          }
        } else {
          profiler(ProfilerEvent.LifecycleHookStart, context, toCall);
          try {
            toCall.call(context);
          } finally {
            profiler(ProfilerEvent.LifecycleHookEnd, context, toCall);
          }
        }
      }
    }
  }
}
function getParentRElement(tView, tNode, lView) {
  return getClosestRElement(tView, tNode.parent, lView);
}
function getClosestRElement(tView, tNode, lView) {
  let parentTNode = tNode;
  while (parentTNode !== null && parentTNode.type & (8 | 32 | 128)) {
    tNode = parentTNode;
    parentTNode = tNode.parent;
  }
  if (parentTNode === null) {
    return lView[HOST];
  } else {
    ngDevMode && assertTNodeType(parentTNode, 3 | 4);
    if (isComponentHost(parentTNode)) {
      ngDevMode && assertTNodeForLView(parentTNode, lView);
      const {
        encapsulation
      } = tView.data[parentTNode.directiveStart + parentTNode.componentOffset];
      if (encapsulation === ViewEncapsulation.None || encapsulation === ViewEncapsulation.Emulated) {
        return null;
      }
    }
    return getNativeByTNode(parentTNode, lView);
  }
}
function getInsertInFrontOfRNode(parentTNode, currentTNode, lView) {
  return _getInsertInFrontOfRNodeWithI18n(parentTNode, currentTNode, lView);
}
function getInsertInFrontOfRNodeWithNoI18n(parentTNode, currentTNode, lView) {
  if (parentTNode.type & (8 | 32)) {
    return getNativeByTNode(parentTNode, lView);
  }
  return null;
}
var _getInsertInFrontOfRNodeWithI18n = getInsertInFrontOfRNodeWithNoI18n;
var _processI18nInsertBefore;
function setI18nHandling(getInsertInFrontOfRNodeWithI18n2, processI18nInsertBefore2) {
  _getInsertInFrontOfRNodeWithI18n = getInsertInFrontOfRNodeWithI18n2;
  _processI18nInsertBefore = processI18nInsertBefore2;
}
function appendChild(tView, lView, childRNode, childTNode) {
  const parentRNode = getParentRElement(tView, childTNode, lView);
  const renderer = lView[RENDERER];
  const parentTNode = childTNode.parent || lView[T_HOST];
  const anchorNode = getInsertInFrontOfRNode(parentTNode, childTNode, lView);
  if (parentRNode != null) {
    if (Array.isArray(childRNode)) {
      for (let i = 0; i < childRNode.length; i++) {
        nativeAppendOrInsertBefore(renderer, parentRNode, childRNode[i], anchorNode, false);
      }
    } else {
      nativeAppendOrInsertBefore(renderer, parentRNode, childRNode, anchorNode, false);
    }
  }
  _processI18nInsertBefore !== void 0 && _processI18nInsertBefore(renderer, childTNode, lView, childRNode, parentRNode);
}
function getFirstNativeNode(lView, tNode) {
  if (tNode !== null) {
    ngDevMode && assertTNodeType(tNode, 3 | 12 | 32 | 16 | 128);
    const tNodeType = tNode.type;
    if (tNodeType & 3) {
      return getNativeByTNode(tNode, lView);
    } else if (tNodeType & 4) {
      return getBeforeNodeForView(-1, lView[tNode.index]);
    } else if (tNodeType & 8) {
      const elIcuContainerChild = tNode.child;
      if (elIcuContainerChild !== null) {
        return getFirstNativeNode(lView, elIcuContainerChild);
      } else {
        const rNodeOrLContainer = lView[tNode.index];
        if (isLContainer(rNodeOrLContainer)) {
          return getBeforeNodeForView(-1, rNodeOrLContainer);
        } else {
          return unwrapRNode(rNodeOrLContainer);
        }
      }
    } else if (tNodeType & 128) {
      return getFirstNativeNode(lView, tNode.next);
    } else if (tNodeType & 32) {
      let nextRNode = icuContainerIterate(tNode, lView);
      let rNode = nextRNode();
      return rNode || unwrapRNode(lView[tNode.index]);
    } else {
      const projectionNodes = getProjectionNodes(lView, tNode);
      if (projectionNodes !== null) {
        if (Array.isArray(projectionNodes)) {
          return projectionNodes[0];
        }
        const parentView = getLViewParent(lView[DECLARATION_COMPONENT_VIEW]);
        ngDevMode && assertParentView(parentView);
        return getFirstNativeNode(parentView, projectionNodes);
      } else {
        return getFirstNativeNode(lView, tNode.next);
      }
    }
  }
  return null;
}
function getProjectionNodes(lView, tNode) {
  if (tNode !== null) {
    const componentView = lView[DECLARATION_COMPONENT_VIEW];
    const componentHost = componentView[T_HOST];
    const slotIdx = tNode.projection;
    ngDevMode && assertProjectionSlots(lView);
    return componentHost.projection[slotIdx];
  }
  return null;
}
function getBeforeNodeForView(viewIndexInContainer, lContainer) {
  const nextViewIndex = CONTAINER_HEADER_OFFSET + viewIndexInContainer + 1;
  if (nextViewIndex < lContainer.length) {
    const lView = lContainer[nextViewIndex];
    const firstTNodeOfView = lView[TVIEW].firstChild;
    if (firstTNodeOfView !== null) {
      return getFirstNativeNode(lView, firstTNodeOfView);
    }
  }
  return lContainer[NATIVE];
}
function applyNodes(renderer, action, tNode, lView, parentRElement, beforeNode, isProjection) {
  while (tNode != null) {
    ngDevMode && assertTNodeForLView(tNode, lView);
    const injector = lView[INJECTOR];
    if (tNode.type === 128) {
      tNode = tNode.next;
      continue;
    }
    ngDevMode && assertTNodeType(tNode, 3 | 12 | 16 | 32);
    const rawSlotValue = lView[tNode.index];
    const tNodeType = tNode.type;
    if (isProjection) {
      if (action === 0) {
        rawSlotValue && attachPatchData(unwrapRNode(rawSlotValue), lView);
        tNode.flags |= 2;
      }
    }
    if (!isDetachedByI18n(tNode)) {
      if (tNodeType & 8) {
        applyNodes(renderer, action, tNode.child, lView, parentRElement, beforeNode, false);
        applyToElementOrContainer(action, renderer, injector, parentRElement, rawSlotValue, tNode, beforeNode, lView);
      } else if (tNodeType & 32) {
        const nextRNode = icuContainerIterate(tNode, lView);
        let rNode;
        while (rNode = nextRNode()) {
          applyToElementOrContainer(action, renderer, injector, parentRElement, rNode, tNode, beforeNode, lView);
        }
        applyToElementOrContainer(action, renderer, injector, parentRElement, rawSlotValue, tNode, beforeNode, lView);
      } else if (tNodeType & 16) {
        applyProjectionRecursive(renderer, action, lView, tNode, parentRElement, beforeNode);
      } else {
        ngDevMode && assertTNodeType(tNode, 3 | 4);
        applyToElementOrContainer(action, renderer, injector, parentRElement, rawSlotValue, tNode, beforeNode, lView);
      }
    }
    tNode = isProjection ? tNode.projectionNext : tNode.next;
  }
}
function applyView(tView, lView, renderer, action, parentRElement, beforeNode) {
  applyNodes(renderer, action, tView.firstChild, lView, parentRElement, beforeNode, false);
}
function applyProjection(tView, lView, tProjectionNode) {
  const renderer = lView[RENDERER];
  const parentRNode = getParentRElement(tView, tProjectionNode, lView);
  const parentTNode = tProjectionNode.parent || lView[T_HOST];
  let beforeNode = getInsertInFrontOfRNode(parentTNode, tProjectionNode, lView);
  applyProjectionRecursive(renderer, 0, lView, tProjectionNode, parentRNode, beforeNode);
}
function applyProjectionRecursive(renderer, action, lView, tProjectionNode, parentRElement, beforeNode) {
  const componentLView = lView[DECLARATION_COMPONENT_VIEW];
  const componentNode = componentLView[T_HOST];
  ngDevMode && assertEqual(typeof tProjectionNode.projection, "number", "expecting projection index");
  const nodeToProjectOrRNodes = componentNode.projection[tProjectionNode.projection];
  if (Array.isArray(nodeToProjectOrRNodes)) {
    for (let i = 0; i < nodeToProjectOrRNodes.length; i++) {
      const rNode = nodeToProjectOrRNodes[i];
      applyToElementOrContainer(action, renderer, lView[INJECTOR], parentRElement, rNode, tProjectionNode, beforeNode, lView);
    }
  } else {
    let nodeToProject = nodeToProjectOrRNodes;
    const projectedComponentLView = componentLView[PARENT];
    if (hasInSkipHydrationBlockFlag(tProjectionNode)) {
      nodeToProject.flags |= 128;
    }
    applyNodes(renderer, action, nodeToProject, projectedComponentLView, parentRElement, beforeNode, true);
  }
}
function applyContainer(renderer, action, injector, lContainer, tNode, parentRElement, beforeNode) {
  ngDevMode && assertLContainer(lContainer);
  const anchor = lContainer[NATIVE];
  const native = unwrapRNode(lContainer);
  if (anchor !== native) {
    applyToElementOrContainer(action, renderer, injector, parentRElement, anchor, tNode, beforeNode);
  }
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    const lView = lContainer[i];
    applyView(lView[TVIEW], lView, renderer, action, parentRElement, anchor);
  }
}
function applyStyling(renderer, isClassBased, rNode, prop, value) {
  if (isClassBased) {
    if (!value) {
      renderer.removeClass(rNode, prop);
    } else {
      renderer.addClass(rNode, prop);
    }
  } else {
    let flags = prop.indexOf("-") === -1 ? void 0 : RendererStyleFlags2.DashCase;
    if (value == null) {
      renderer.removeStyle(rNode, prop, flags);
    } else {
      const isImportant = typeof value === "string" ? value.endsWith("!important") : false;
      if (isImportant) {
        value = value.slice(0, -10);
        flags |= RendererStyleFlags2.Important;
      }
      renderer.setStyle(rNode, prop, value, flags);
    }
  }
}
function executeTemplate(tView, lView, templateFn, rf, context) {
  const prevSelectedIndex = getSelectedIndex();
  const isUpdatePhase = rf & 2;
  try {
    setSelectedIndex(-1);
    if (isUpdatePhase && lView.length > HEADER_OFFSET) {
      selectIndexInternal(tView, lView, HEADER_OFFSET, !!ngDevMode && isInCheckNoChangesMode());
    }
    const preHookType = isUpdatePhase ? ProfilerEvent.TemplateUpdateStart : ProfilerEvent.TemplateCreateStart;
    profiler(preHookType, context, templateFn);
    templateFn(rf, context);
  } finally {
    setSelectedIndex(prevSelectedIndex);
    const postHookType = isUpdatePhase ? ProfilerEvent.TemplateUpdateEnd : ProfilerEvent.TemplateCreateEnd;
    profiler(postHookType, context, templateFn);
  }
}
function createDirectivesInstances(tView, lView, tNode) {
  instantiateAllDirectives(tView, lView, tNode);
  if ((tNode.flags & 64) === 64) {
    invokeDirectivesHostBindings(tView, lView, tNode);
  }
}
function saveResolvedLocalsInData(viewData, tNode, localRefExtractor = getNativeByTNode) {
  const localNames = tNode.localNames;
  if (localNames !== null) {
    let localIndex = tNode.index + 1;
    for (let i = 0; i < localNames.length; i += 2) {
      const index = localNames[i + 1];
      const value = index === -1 ? localRefExtractor(tNode, viewData) : viewData[index];
      viewData[localIndex++] = value;
    }
  }
}
function locateHostElement(renderer, elementOrSelector, encapsulation, injector) {
  const preserveHostContent = injector.get(PRESERVE_HOST_CONTENT, PRESERVE_HOST_CONTENT_DEFAULT);
  const preserveContent = preserveHostContent || encapsulation === ViewEncapsulation.ShadowDom || encapsulation === ViewEncapsulation.ExperimentalIsolatedShadowDom;
  const rootElement = renderer.selectRootElement(elementOrSelector, preserveContent);
  applyRootElementTransform(rootElement);
  return rootElement;
}
function applyRootElementTransform(rootElement) {
  _applyRootElementTransformImpl(rootElement);
}
var _applyRootElementTransformImpl = () => null;
function applyRootElementTransformImpl(rootElement) {
  if (hasSkipHydrationAttrOnRElement(rootElement)) {
    clearElementContents(rootElement);
  } else {
    processTextNodeMarkersBeforeHydration(rootElement);
  }
}
function enableApplyRootElementTransformImpl() {
  _applyRootElementTransformImpl = applyRootElementTransformImpl;
}
function mapPropName(name) {
  if (name === "class") return "className";
  if (name === "for") return "htmlFor";
  if (name === "formaction") return "formAction";
  if (name === "innerHtml") return "innerHTML";
  if (name === "readonly") return "readOnly";
  if (name === "tabindex") return "tabIndex";
  return name;
}
function setPropertyAndInputs(tNode, lView, propName, value, renderer, sanitizer) {
  ngDevMode && assertNotSame(value, NO_CHANGE, "Incoming value should never be NO_CHANGE.");
  const tView = lView[TVIEW];
  const hasSetInput = setAllInputsForProperty(tNode, tView, lView, propName, value);
  if (hasSetInput) {
    isComponentHost(tNode) && markDirtyIfOnPush(lView, tNode.index);
    ngDevMode && setNgReflectProperties(lView, tView, tNode, propName, value);
    return;
  }
  if (tNode.type & 3) {
    propName = mapPropName(propName);
  }
  setDomProperty(tNode, lView, propName, value, renderer, sanitizer);
}
function setDomProperty(tNode, lView, propName, value, renderer, sanitizer) {
  if (tNode.type & 3) {
    const element = getNativeByTNode(tNode, lView);
    if (ngDevMode) {
      validateAgainstEventProperties(propName);
      if (!isPropertyValid(element, propName, tNode.value, lView[TVIEW].schemas)) {
        handleUnknownPropertyError(propName, tNode.value, tNode.type, lView);
      }
    }
    value = sanitizer != null ? sanitizer(value, tNode.value || "", propName) : value;
    renderer.setProperty(element, propName, value);
  } else if (tNode.type & 12) {
    if (ngDevMode && !matchingSchemas(lView[TVIEW].schemas, tNode.value)) {
      handleUnknownPropertyError(propName, tNode.value, tNode.type, lView);
    }
  }
}
function markDirtyIfOnPush(lView, viewIndex) {
  ngDevMode && assertLView(lView);
  const childComponentLView = getComponentLViewByIndex(viewIndex, lView);
  if (!(childComponentLView[FLAGS] & 16)) {
    childComponentLView[FLAGS] |= 64;
  }
}
function setNgReflectProperty(lView, tNode, attrName, value) {
  const environment = lView[ENVIRONMENT];
  if (!environment.ngReflect) {
    return;
  }
  const element = getNativeByTNode(tNode, lView);
  const renderer = lView[RENDERER];
  attrName = normalizeDebugBindingName(attrName);
  const debugValue = normalizeDebugBindingValue(value);
  if (tNode.type & 3) {
    if (value == null) {
      renderer.removeAttribute(element, attrName);
    } else {
      renderer.setAttribute(element, attrName, debugValue);
    }
  } else {
    const textContent = escapeCommentText(`bindings=${JSON.stringify({
      [attrName]: debugValue
    }, null, 2)}`);
    renderer.setValue(element, textContent);
  }
}
function setNgReflectProperties(lView, tView, tNode, publicName, value) {
  const environment = lView[ENVIRONMENT];
  if (!environment.ngReflect || !(tNode.type & (3 | 4))) {
    return;
  }
  const inputConfig = tNode.inputs?.[publicName];
  const hostInputConfig = tNode.hostDirectiveInputs?.[publicName];
  if (hostInputConfig) {
    for (let i = 0; i < hostInputConfig.length; i += 2) {
      const index = hostInputConfig[i];
      const publicName2 = hostInputConfig[i + 1];
      const def = tView.data[index];
      setNgReflectProperty(lView, tNode, def.inputs[publicName2][0], value);
    }
  }
  if (inputConfig) {
    for (const index of inputConfig) {
      const def = tView.data[index];
      setNgReflectProperty(lView, tNode, def.inputs[publicName][0], value);
    }
  }
}
function instantiateAllDirectives(tView, lView, tNode) {
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  if (isComponentHost(tNode)) {
    ngDevMode && assertTNodeType(tNode, 3);
    createComponentLView(lView, tNode, tView.data[start + tNode.componentOffset]);
  }
  if (!tView.firstCreatePass) {
    getOrCreateNodeInjectorForNode(tNode, lView);
  }
  const initialInputs = tNode.initialInputs;
  for (let i = start; i < end; i++) {
    const def = tView.data[i];
    const directive = getNodeInjectable(lView, tView, i, tNode);
    attachPatchData(directive, lView);
    if (initialInputs !== null) {
      setInputsFromAttrs(lView, i - start, directive, def, tNode, initialInputs);
    }
    if (isComponentDef(def)) {
      const componentView = getComponentLViewByIndex(tNode.index, lView);
      componentView[CONTEXT] = getNodeInjectable(lView, tView, i, tNode);
    }
  }
}
function invokeDirectivesHostBindings(tView, lView, tNode) {
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  const elementIndex = tNode.index;
  const currentDirectiveIndex = getCurrentDirectiveIndex();
  try {
    setSelectedIndex(elementIndex);
    for (let dirIndex = start; dirIndex < end; dirIndex++) {
      const def = tView.data[dirIndex];
      const directive = lView[dirIndex];
      setCurrentDirectiveIndex(dirIndex);
      if (def.hostBindings !== null || def.hostVars !== 0 || def.hostAttrs !== null) {
        invokeHostBindingsInCreationMode(def, directive);
      }
    }
  } finally {
    setSelectedIndex(-1);
    setCurrentDirectiveIndex(currentDirectiveIndex);
  }
}
function invokeHostBindingsInCreationMode(def, directive) {
  if (def.hostBindings !== null) {
    def.hostBindings(1, directive);
  }
}
function findDirectiveDefMatches(tView, tNode) {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && assertTNodeType(tNode, 3 | 12);
  const registry = tView.directiveRegistry;
  let matches = null;
  if (registry) {
    for (let i = 0; i < registry.length; i++) {
      const def = registry[i];
      if (isNodeMatchingSelectorList(tNode, def.selectors, false)) {
        matches ??= [];
        if (isComponentDef(def)) {
          if (ngDevMode) {
            assertTNodeType(tNode, 2, `"${tNode.value}" tags cannot be used as component hosts. Please use a different tag to activate the ${stringify(def.type)} component.`);
            if (matches.length && isComponentDef(matches[0])) {
              throwMultipleComponentError(tNode, matches.find(isComponentDef).type, def.type);
            }
          }
          matches.unshift(def);
        } else {
          matches.push(def);
        }
      }
    }
  }
  return matches;
}
function elementAttributeInternal(tNode, lView, name, value, sanitizer, namespace) {
  if (ngDevMode) {
    assertNotSame(value, NO_CHANGE, "Incoming value should never be NO_CHANGE.");
    validateAgainstEventAttributes(name);
    assertTNodeType(tNode, 2, `Attempted to set attribute \`${name}\` on a container node. Host bindings are not valid on ng-container or ng-template.`);
  }
  const element = getNativeByTNode(tNode, lView);
  setElementAttribute(lView[RENDERER], element, namespace, tNode.value, name, value, sanitizer);
}
function setElementAttribute(renderer, element, namespace, tagName, name, value, sanitizer) {
  if (value == null) {
    renderer.removeAttribute(element, name, namespace);
  } else {
    const strValue = sanitizer == null ? renderStringify(value) : sanitizer(value, tagName || "", name);
    renderer.setAttribute(element, name, strValue, namespace);
  }
}
function setInputsFromAttrs(lView, directiveIndex, instance, def, tNode, initialInputData) {
  const initialInputs = initialInputData[directiveIndex];
  if (initialInputs !== null) {
    for (let i = 0; i < initialInputs.length; i += 2) {
      const lookupName = initialInputs[i];
      const value = initialInputs[i + 1];
      writeToDirectiveInput(def, instance, lookupName, value);
      if (ngDevMode) {
        setNgReflectProperty(lView, tNode, def.inputs[lookupName][0], value);
      }
    }
  }
}
function elementLikeStartShared(tNode, lView, index, name, locateOrCreateNativeNode) {
  const adjustedIndex = HEADER_OFFSET + index;
  const tView = lView[TVIEW];
  const native = locateOrCreateNativeNode(tView, lView, tNode, name, index);
  lView[adjustedIndex] = native;
  setCurrentTNode(tNode, true);
  const isElement = tNode.type === 2;
  if (isElement) {
    setupStaticAttributes(lView[RENDERER], native, tNode);
    if (getElementDepthCount() === 0 || isDirectiveHost(tNode)) {
      attachPatchData(native, lView);
    }
    increaseElementDepthCount();
  } else {
    attachPatchData(native, lView);
  }
  if (wasLastNodeCreated() && (!isElement || !isDetachedByI18n(tNode))) {
    appendChild(tView, lView, native, tNode);
  }
  return tNode;
}
function elementLikeEndShared(tNode) {
  let currentTNode = tNode;
  if (isCurrentTNodeParent()) {
    setCurrentTNodeAsNotParent();
  } else {
    ngDevMode && assertHasParent(getCurrentTNode());
    currentTNode = currentTNode.parent;
    setCurrentTNode(currentTNode, false);
  }
  return currentTNode;
}
function storePropertyBindingMetadata(tData, tNode, propertyName, bindingIndex, ...interpolationParts) {
  if (tData[bindingIndex] === null) {
    if (!tNode.inputs?.[propertyName] && !tNode.hostDirectiveInputs?.[propertyName]) {
      const propBindingIdxs = tNode.propertyBindings || (tNode.propertyBindings = []);
      propBindingIdxs.push(bindingIndex);
      let bindingMetadata = propertyName;
      if (interpolationParts.length > 0) {
        bindingMetadata += INTERPOLATION_DELIMITER + interpolationParts.join(INTERPOLATION_DELIMITER);
      }
      tData[bindingIndex] = bindingMetadata;
    }
  }
}
function loadComponentRenderer(currentDef, tNode, lView) {
  if (currentDef === null || isComponentDef(currentDef)) {
    lView = unwrapLView(lView[tNode.index]);
  }
  return lView[RENDERER];
}
function handleUncaughtError(lView, error) {
  const injector = lView[INJECTOR];
  if (!injector) {
    return;
  }
  let errorHandler;
  try {
    errorHandler = injector.get(INTERNAL_APPLICATION_ERROR_HANDLER, null);
  } catch {
    errorHandler = null;
  }
  errorHandler?.(error);
}
function setAllInputsForProperty(tNode, tView, lView, publicName, value) {
  const inputs = tNode.inputs?.[publicName];
  const hostDirectiveInputs = tNode.hostDirectiveInputs?.[publicName];
  let hasMatch = false;
  if (hostDirectiveInputs) {
    for (let i = 0; i < hostDirectiveInputs.length; i += 2) {
      const index = hostDirectiveInputs[i];
      ngDevMode && assertIndexInRange(lView, index);
      const publicName2 = hostDirectiveInputs[i + 1];
      const def = tView.data[index];
      writeToDirectiveInput(def, lView[index], publicName2, value);
      hasMatch = true;
    }
  }
  if (inputs) {
    for (const index of inputs) {
      ngDevMode && assertIndexInRange(lView, index);
      const instance = lView[index];
      const def = tView.data[index];
      writeToDirectiveInput(def, instance, publicName, value);
      hasMatch = true;
    }
  }
  return hasMatch;
}
function setDirectiveInput(tNode, tView, lView, target, publicName, value) {
  let hostIndex = null;
  let hostDirectivesStart = null;
  let hostDirectivesEnd = null;
  let hasSet = false;
  if (ngDevMode && !tNode.directiveToIndex?.has(target.type)) {
    throw new Error(`Node does not have a directive with type ${target.type.name}`);
  }
  const data = tNode.directiveToIndex.get(target.type);
  if (typeof data === "number") {
    hostIndex = data;
  } else {
    [hostIndex, hostDirectivesStart, hostDirectivesEnd] = data;
  }
  if (hostDirectivesStart !== null && hostDirectivesEnd !== null && tNode.hostDirectiveInputs?.hasOwnProperty(publicName)) {
    const hostDirectiveInputs = tNode.hostDirectiveInputs[publicName];
    for (let i = 0; i < hostDirectiveInputs.length; i += 2) {
      const index = hostDirectiveInputs[i];
      if (index >= hostDirectivesStart && index <= hostDirectivesEnd) {
        ngDevMode && assertIndexInRange(lView, index);
        const def = tView.data[index];
        const hostDirectivePublicName = hostDirectiveInputs[i + 1];
        writeToDirectiveInput(def, lView[index], hostDirectivePublicName, value);
        hasSet = true;
      } else if (index > hostDirectivesEnd) {
        break;
      }
    }
  }
  if (hostIndex !== null && target.inputs.hasOwnProperty(publicName)) {
    ngDevMode && assertIndexInRange(lView, hostIndex);
    writeToDirectiveInput(target, lView[hostIndex], publicName, value);
    hasSet = true;
  }
  return hasSet;
}
function renderComponent(hostLView, componentHostIdx) {
  ngDevMode && assertEqual(isCreationMode(hostLView), true, "Should be run in creation mode");
  const componentView = getComponentLViewByIndex(componentHostIdx, hostLView);
  const componentTView = componentView[TVIEW];
  syncViewWithBlueprint(componentTView, componentView);
  const hostRNode = componentView[HOST];
  if (hostRNode !== null && componentView[HYDRATION] === null) {
    componentView[HYDRATION] = retrieveHydrationInfo(hostRNode, componentView[INJECTOR]);
  }
  profiler(ProfilerEvent.ComponentStart);
  try {
    renderView(componentTView, componentView, componentView[CONTEXT]);
  } finally {
    profiler(ProfilerEvent.ComponentEnd, componentView[CONTEXT]);
  }
}
function syncViewWithBlueprint(tView, lView) {
  for (let i = lView.length; i < tView.blueprint.length; i++) {
    lView.push(tView.blueprint[i]);
  }
}
function renderView(tView, lView, context) {
  ngDevMode && assertEqual(isCreationMode(lView), true, "Should be run in creation mode");
  ngDevMode && assertNotReactive(renderView.name);
  enterView(lView);
  try {
    const viewQuery = tView.viewQuery;
    if (viewQuery !== null) {
      executeViewQueryFn(1, viewQuery, context);
    }
    const templateFn = tView.template;
    if (templateFn !== null) {
      executeTemplate(tView, lView, templateFn, 1, context);
    }
    if (tView.firstCreatePass) {
      tView.firstCreatePass = false;
    }
    lView[QUERIES]?.finishViewCreation(tView);
    if (tView.staticContentQueries) {
      refreshContentQueries(tView, lView);
    }
    if (tView.staticViewQueries) {
      executeViewQueryFn(2, tView.viewQuery, context);
    }
    const components = tView.components;
    if (components !== null) {
      renderChildComponents(lView, components);
    }
  } catch (error) {
    if (tView.firstCreatePass) {
      tView.incompleteFirstPass = true;
      tView.firstCreatePass = false;
    }
    throw error;
  } finally {
    lView[FLAGS] &= ~4;
    leaveView();
  }
}
function renderChildComponents(hostLView, components) {
  for (let i = 0; i < components.length; i++) {
    renderComponent(hostLView, components[i]);
  }
}
function createAndRenderEmbeddedLView(declarationLView, templateTNode, context, options) {
  const prevConsumer = setActiveConsumer(null);
  try {
    const embeddedTView = templateTNode.tView;
    ngDevMode && assertDefined(embeddedTView, "TView must be defined for a template node.");
    ngDevMode && assertTNodeForLView(templateTNode, declarationLView);
    const isSignalView = declarationLView[FLAGS] & 4096;
    const viewFlags = isSignalView ? 4096 : 16;
    const embeddedLView = createLView(declarationLView, embeddedTView, context, viewFlags, null, templateTNode, null, null, options?.injector ?? null, options?.embeddedViewInjector ?? null, options?.dehydratedView ?? null);
    const declarationLContainer = declarationLView[templateTNode.index];
    ngDevMode && assertLContainer(declarationLContainer);
    embeddedLView[DECLARATION_LCONTAINER] = declarationLContainer;
    const declarationViewLQueries = declarationLView[QUERIES];
    if (declarationViewLQueries !== null) {
      embeddedLView[QUERIES] = declarationViewLQueries.createEmbeddedView(embeddedTView);
    }
    renderView(embeddedTView, embeddedLView, context);
    return embeddedLView;
  } finally {
    setActiveConsumer(prevConsumer);
  }
}
function shouldAddViewToDom(tNode, dehydratedView) {
  return !dehydratedView || dehydratedView.firstChild === null || hasInSkipHydrationBlockFlag(tNode);
}
var USE_EXHAUSTIVE_CHECK_NO_CHANGES_DEFAULT = false;
var UseExhaustiveCheckNoChanges = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "exhaustive checkNoChanges" : "");
function collectNativeNodes(tView, lView, tNode, result, isProjection = false) {
  while (tNode !== null) {
    if (tNode.type === 128) {
      tNode = isProjection ? tNode.projectionNext : tNode.next;
      continue;
    }
    ngDevMode && assertTNodeType(tNode, 3 | 12 | 16 | 32);
    const lNode = lView[tNode.index];
    if (lNode !== null) {
      result.push(unwrapRNode(lNode));
    }
    if (isLContainer(lNode)) {
      collectNativeNodesInLContainer(lNode, result);
    }
    const tNodeType = tNode.type;
    if (tNodeType & 8) {
      collectNativeNodes(tView, lView, tNode.child, result);
    } else if (tNodeType & 32) {
      const nextRNode = icuContainerIterate(tNode, lView);
      let rNode;
      while (rNode = nextRNode()) {
        result.push(rNode);
      }
    } else if (tNodeType & 16) {
      const nodesInSlot = getProjectionNodes(lView, tNode);
      if (Array.isArray(nodesInSlot)) {
        result.push(...nodesInSlot);
      } else {
        const parentView = getLViewParent(lView[DECLARATION_COMPONENT_VIEW]);
        ngDevMode && assertParentView(parentView);
        collectNativeNodes(parentView[TVIEW], parentView, nodesInSlot, result, true);
      }
    }
    tNode = isProjection ? tNode.projectionNext : tNode.next;
  }
  return result;
}
function collectNativeNodesInLContainer(lContainer, result) {
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    const lViewInAContainer = lContainer[i];
    const lViewFirstChildTNode = lViewInAContainer[TVIEW].firstChild;
    if (lViewFirstChildTNode !== null) {
      collectNativeNodes(lViewInAContainer[TVIEW], lViewInAContainer, lViewFirstChildTNode, result);
    }
  }
  if (lContainer[NATIVE] !== lContainer[HOST]) {
    result.push(lContainer[NATIVE]);
  }
}
function addAfterRenderSequencesForView(lView) {
  if (lView[AFTER_RENDER_SEQUENCES_TO_ADD] !== null) {
    for (const sequence of lView[AFTER_RENDER_SEQUENCES_TO_ADD]) {
      sequence.impl.addSequence(sequence);
    }
    lView[AFTER_RENDER_SEQUENCES_TO_ADD].length = 0;
  }
}
var freeConsumers = [];
function getOrBorrowReactiveLViewConsumer(lView) {
  return lView[REACTIVE_TEMPLATE_CONSUMER] ?? borrowReactiveLViewConsumer(lView);
}
function borrowReactiveLViewConsumer(lView) {
  const consumer = freeConsumers.pop() ?? Object.create(REACTIVE_LVIEW_CONSUMER_NODE);
  consumer.lView = lView;
  return consumer;
}
function maybeReturnReactiveLViewConsumer(consumer) {
  if (consumer.lView[REACTIVE_TEMPLATE_CONSUMER] === consumer) {
    return;
  }
  consumer.lView = null;
  freeConsumers.push(consumer);
}
var REACTIVE_LVIEW_CONSUMER_NODE = __spreadProps(__spreadValues({}, REACTIVE_NODE), {
  consumerIsAlwaysLive: true,
  kind: "template",
  consumerMarkedDirty: (node) => {
    markAncestorsForTraversal(node.lView);
  },
  consumerOnSignalRead() {
    this.lView[REACTIVE_TEMPLATE_CONSUMER] = this;
  }
});
function getOrCreateTemporaryConsumer(lView) {
  const consumer = lView[REACTIVE_TEMPLATE_CONSUMER] ?? Object.create(TEMPORARY_CONSUMER_NODE);
  consumer.lView = lView;
  return consumer;
}
var TEMPORARY_CONSUMER_NODE = __spreadProps(__spreadValues({}, REACTIVE_NODE), {
  consumerIsAlwaysLive: true,
  kind: "template",
  consumerMarkedDirty: (node) => {
    let parent = getLViewParent(node.lView);
    while (parent && !viewShouldHaveReactiveConsumer(parent[TVIEW])) {
      parent = getLViewParent(parent);
    }
    if (!parent) {
      return;
    }
    markViewForRefresh(parent);
  },
  consumerOnSignalRead() {
    this.lView[REACTIVE_TEMPLATE_CONSUMER] = this;
  }
});
function viewShouldHaveReactiveConsumer(tView) {
  return tView.type !== 2;
}
function isReactiveLViewConsumer(node) {
  return node.kind === "template";
}
function runEffectsInView(view) {
  if (view[EFFECTS] === null) {
    return;
  }
  let tryFlushEffects = true;
  while (tryFlushEffects) {
    let foundDirtyEffect = false;
    for (const effect2 of view[EFFECTS]) {
      if (!effect2.dirty) {
        continue;
      }
      foundDirtyEffect = true;
      if (effect2.zone === null || Zone.current === effect2.zone) {
        effect2.run();
      } else {
        effect2.zone.run(() => effect2.run());
      }
    }
    tryFlushEffects = foundDirtyEffect && !!(view[FLAGS] & 8192);
  }
}
var MAXIMUM_REFRESH_RERUNS$1 = 100;
function detectChangesInternal(lView, mode = 0) {
  const environment = lView[ENVIRONMENT];
  const rendererFactory = environment.rendererFactory;
  const checkNoChangesMode = !!ngDevMode && isInCheckNoChangesMode();
  if (!checkNoChangesMode) {
    rendererFactory.begin?.();
  }
  try {
    detectChangesInViewWhileDirty(lView, mode);
  } finally {
    if (!checkNoChangesMode) {
      rendererFactory.end?.();
    }
  }
}
function detectChangesInViewWhileDirty(lView, mode) {
  const lastIsRefreshingViewsValue = isRefreshingViews();
  try {
    setIsRefreshingViews(true);
    detectChangesInView(lView, mode);
    if (ngDevMode && isExhaustiveCheckNoChanges()) {
      return;
    }
    let retries = 0;
    while (requiresRefreshOrTraversal(lView)) {
      if (retries === MAXIMUM_REFRESH_RERUNS$1) {
        throw new RuntimeError(103, ngDevMode && "Infinite change detection while trying to refresh views. There may be components which each cause the other to require a refresh, causing an infinite loop.");
      }
      retries++;
      detectChangesInView(lView, 1);
    }
  } finally {
    setIsRefreshingViews(lastIsRefreshingViewsValue);
  }
}
function checkNoChangesInternal(lView, exhaustive) {
  setIsInCheckNoChangesMode(exhaustive ? CheckNoChangesMode.Exhaustive : CheckNoChangesMode.OnlyDirtyViews);
  try {
    detectChangesInternal(lView);
  } finally {
    setIsInCheckNoChangesMode(CheckNoChangesMode.Off);
  }
}
function refreshView(tView, lView, templateFn, context) {
  ngDevMode && assertEqual(isCreationMode(lView), false, "Should be run in update mode");
  if (isDestroyed(lView)) return;
  const flags = lView[FLAGS];
  const isInCheckNoChangesPass = ngDevMode && isInCheckNoChangesMode();
  const isInExhaustiveCheckNoChangesPass = ngDevMode && isExhaustiveCheckNoChanges();
  enterView(lView);
  let returnConsumerToPool = true;
  let prevConsumer = null;
  let currentConsumer = null;
  if (!isInCheckNoChangesPass) {
    if (viewShouldHaveReactiveConsumer(tView)) {
      currentConsumer = getOrBorrowReactiveLViewConsumer(lView);
      prevConsumer = consumerBeforeComputation(currentConsumer);
    } else if (getActiveConsumer() === null) {
      returnConsumerToPool = false;
      currentConsumer = getOrCreateTemporaryConsumer(lView);
      prevConsumer = consumerBeforeComputation(currentConsumer);
    } else if (lView[REACTIVE_TEMPLATE_CONSUMER]) {
      consumerDestroy(lView[REACTIVE_TEMPLATE_CONSUMER]);
      lView[REACTIVE_TEMPLATE_CONSUMER] = null;
    }
  }
  try {
    resetPreOrderHookFlags(lView);
    setBindingIndex(tView.bindingStartIndex);
    if (templateFn !== null) {
      executeTemplate(tView, lView, templateFn, 2, context);
    }
    const hooksInitPhaseCompleted = (flags & 3) === 3;
    if (!isInCheckNoChangesPass) {
      if (hooksInitPhaseCompleted) {
        const preOrderCheckHooks = tView.preOrderCheckHooks;
        if (preOrderCheckHooks !== null) {
          executeCheckHooks(lView, preOrderCheckHooks, null);
        }
      } else {
        const preOrderHooks = tView.preOrderHooks;
        if (preOrderHooks !== null) {
          executeInitAndCheckHooks(lView, preOrderHooks, 0, null);
        }
        incrementInitPhaseFlags(lView, 0);
      }
    }
    if (!isInExhaustiveCheckNoChangesPass) {
      markTransplantedViewsForRefresh(lView);
    }
    runEffectsInView(lView);
    detectChangesInEmbeddedViews(lView, 0);
    if (tView.contentQueries !== null) {
      refreshContentQueries(tView, lView);
    }
    if (!isInCheckNoChangesPass) {
      if (hooksInitPhaseCompleted) {
        const contentCheckHooks = tView.contentCheckHooks;
        if (contentCheckHooks !== null) {
          executeCheckHooks(lView, contentCheckHooks);
        }
      } else {
        const contentHooks = tView.contentHooks;
        if (contentHooks !== null) {
          executeInitAndCheckHooks(lView, contentHooks, 1);
        }
        incrementInitPhaseFlags(lView, 1);
      }
    }
    processHostBindingOpCodes(tView, lView);
    const components = tView.components;
    if (components !== null) {
      detectChangesInChildComponents(lView, components, 0);
    }
    const viewQuery = tView.viewQuery;
    if (viewQuery !== null) {
      executeViewQueryFn(2, viewQuery, context);
    }
    if (!isInCheckNoChangesPass) {
      if (hooksInitPhaseCompleted) {
        const viewCheckHooks = tView.viewCheckHooks;
        if (viewCheckHooks !== null) {
          executeCheckHooks(lView, viewCheckHooks);
        }
      } else {
        const viewHooks = tView.viewHooks;
        if (viewHooks !== null) {
          executeInitAndCheckHooks(lView, viewHooks, 2);
        }
        incrementInitPhaseFlags(lView, 2);
      }
    }
    if (tView.firstUpdatePass === true) {
      tView.firstUpdatePass = false;
    }
    if (lView[EFFECTS_TO_SCHEDULE]) {
      for (const notifyEffect of lView[EFFECTS_TO_SCHEDULE]) {
        notifyEffect();
      }
      lView[EFFECTS_TO_SCHEDULE] = null;
    }
    if (!isInCheckNoChangesPass) {
      addAfterRenderSequencesForView(lView);
      lView[FLAGS] &= ~(64 | 8);
    }
  } catch (e) {
    if (!isInCheckNoChangesPass) {
      markAncestorsForTraversal(lView);
    }
    throw e;
  } finally {
    if (currentConsumer !== null) {
      consumerAfterComputation(currentConsumer, prevConsumer);
      if (returnConsumerToPool) {
        maybeReturnReactiveLViewConsumer(currentConsumer);
      }
    }
    leaveView();
  }
}
function detectChangesInEmbeddedViews(lView, mode) {
  for (let lContainer = getFirstLContainer(lView); lContainer !== null; lContainer = getNextLContainer(lContainer)) {
    for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
      const embeddedLView = lContainer[i];
      detectChangesInViewIfAttached(embeddedLView, mode);
    }
  }
}
function markTransplantedViewsForRefresh(lView) {
  for (let lContainer = getFirstLContainer(lView); lContainer !== null; lContainer = getNextLContainer(lContainer)) {
    if (!(lContainer[FLAGS] & 2)) continue;
    const movedViews = lContainer[MOVED_VIEWS];
    ngDevMode && assertDefined(movedViews, "Transplanted View flags set but missing MOVED_VIEWS");
    for (let i = 0; i < movedViews.length; i++) {
      const movedLView = movedViews[i];
      markViewForRefresh(movedLView);
    }
  }
}
function detectChangesInComponent(hostLView, componentHostIdx, mode) {
  ngDevMode && assertEqual(isCreationMode(hostLView), false, "Should be run in update mode");
  profiler(ProfilerEvent.ComponentStart);
  const componentView = getComponentLViewByIndex(componentHostIdx, hostLView);
  try {
    detectChangesInViewIfAttached(componentView, mode);
  } finally {
    profiler(ProfilerEvent.ComponentEnd, componentView[CONTEXT]);
  }
}
function detectChangesInViewIfAttached(lView, mode) {
  if (!viewAttachedToChangeDetector(lView)) {
    return;
  }
  detectChangesInView(lView, mode);
}
function detectChangesInView(lView, mode) {
  const isInCheckNoChangesPass = ngDevMode && isInCheckNoChangesMode();
  const tView = lView[TVIEW];
  const flags = lView[FLAGS];
  const consumer = lView[REACTIVE_TEMPLATE_CONSUMER];
  let shouldRefreshView = !!(mode === 0 && flags & 16);
  shouldRefreshView ||= !!(flags & 64 && mode === 0 && !isInCheckNoChangesPass);
  shouldRefreshView ||= !!(flags & 1024);
  shouldRefreshView ||= !!(consumer?.dirty && consumerPollProducersForChange(consumer));
  shouldRefreshView ||= !!(ngDevMode && isExhaustiveCheckNoChanges());
  if (consumer) {
    consumer.dirty = false;
  }
  lView[FLAGS] &= ~(8192 | 1024);
  if (shouldRefreshView) {
    refreshView(tView, lView, tView.template, lView[CONTEXT]);
  } else if (flags & 8192) {
    const prevConsumer = setActiveConsumer(null);
    try {
      if (!isInCheckNoChangesPass) {
        runEffectsInView(lView);
      }
      detectChangesInEmbeddedViews(lView, 1);
      const components = tView.components;
      if (components !== null) {
        detectChangesInChildComponents(lView, components, 1);
      }
      if (!isInCheckNoChangesPass) {
        addAfterRenderSequencesForView(lView);
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}
function detectChangesInChildComponents(hostLView, components, mode) {
  for (let i = 0; i < components.length; i++) {
    detectChangesInComponent(hostLView, components[i], mode);
  }
}
function processHostBindingOpCodes(tView, lView) {
  const hostBindingOpCodes = tView.hostBindingOpCodes;
  if (hostBindingOpCodes === null) return;
  try {
    for (let i = 0; i < hostBindingOpCodes.length; i++) {
      const opCode = hostBindingOpCodes[i];
      if (opCode < 0) {
        setSelectedIndex(~opCode);
      } else {
        const directiveIdx = opCode;
        const bindingRootIndx = hostBindingOpCodes[++i];
        const hostBindingFn = hostBindingOpCodes[++i];
        setBindingRootForHostBindings(bindingRootIndx, directiveIdx);
        const context = lView[directiveIdx];
        profiler(ProfilerEvent.HostBindingsUpdateStart, context);
        try {
          hostBindingFn(2, context);
        } finally {
          profiler(ProfilerEvent.HostBindingsUpdateEnd, context);
        }
      }
    }
  } finally {
    setSelectedIndex(-1);
  }
}
function markViewDirty(lView, source) {
  const dirtyBitsToUse = isRefreshingViews() ? 64 : 1024 | 64;
  lView[ENVIRONMENT].changeDetectionScheduler?.notify(source);
  while (lView) {
    lView[FLAGS] |= dirtyBitsToUse;
    const parent = getLViewParent(lView);
    if (isRootView(lView) && !parent) {
      return lView;
    }
    lView = parent;
  }
  return null;
}
function createLContainer(hostNative, currentView, native, tNode) {
  ngDevMode && assertLView(currentView);
  const lContainer = [hostNative, true, 0, currentView, null, tNode, null, native, null, null];
  ngDevMode && assertEqual(lContainer.length, CONTAINER_HEADER_OFFSET, "Should allocate correct number of slots for LContainer header.");
  return lContainer;
}
function getLViewFromLContainer(lContainer, index) {
  const adjustedIndex = CONTAINER_HEADER_OFFSET + index;
  if (adjustedIndex < lContainer.length) {
    const lView = lContainer[adjustedIndex];
    ngDevMode && assertLView(lView);
    return lView;
  }
  return void 0;
}
function addLViewToLContainer(lContainer, lView, index, addToDOM = true) {
  const tView = lView[TVIEW];
  insertView(tView, lView, lContainer, index);
  if (addToDOM) {
    const beforeNode = getBeforeNodeForView(index, lContainer);
    const renderer = lView[RENDERER];
    const parentRNode = renderer.parentNode(lContainer[NATIVE]);
    if (parentRNode !== null) {
      addViewToDOM(tView, lContainer[T_HOST], renderer, lView, parentRNode, beforeNode);
    }
  }
  const hydrationInfo = lView[HYDRATION];
  if (hydrationInfo !== null && hydrationInfo.firstChild !== null) {
    hydrationInfo.firstChild = null;
  }
}
function removeLViewFromLContainer(lContainer, index) {
  const lView = detachView(lContainer, index);
  if (lView !== void 0) {
    destroyLView(lView[TVIEW], lView);
  }
  return lView;
}
function detachView(lContainer, removeIndex) {
  if (lContainer.length <= CONTAINER_HEADER_OFFSET) return;
  const indexInContainer = CONTAINER_HEADER_OFFSET + removeIndex;
  const viewToDetach = lContainer[indexInContainer];
  if (viewToDetach) {
    const declarationLContainer = viewToDetach[DECLARATION_LCONTAINER];
    if (declarationLContainer !== null && declarationLContainer !== lContainer) {
      detachMovedView(declarationLContainer, viewToDetach);
    }
    if (removeIndex > 0) {
      lContainer[indexInContainer - 1][NEXT] = viewToDetach[NEXT];
    }
    const removedLView = removeFromArray(lContainer, CONTAINER_HEADER_OFFSET + removeIndex);
    removeViewFromDOM(viewToDetach[TVIEW], viewToDetach);
    const lQueries = removedLView[QUERIES];
    if (lQueries !== null) {
      lQueries.detachView(removedLView[TVIEW]);
    }
    viewToDetach[PARENT] = null;
    viewToDetach[NEXT] = null;
    viewToDetach[FLAGS] &= ~128;
  }
  return viewToDetach;
}
function insertView(tView, lView, lContainer, index) {
  ngDevMode && assertLView(lView);
  ngDevMode && assertLContainer(lContainer);
  const indexInContainer = CONTAINER_HEADER_OFFSET + index;
  const containerLength = lContainer.length;
  if (index > 0) {
    lContainer[indexInContainer - 1][NEXT] = lView;
  }
  if (index < containerLength - CONTAINER_HEADER_OFFSET) {
    lView[NEXT] = lContainer[indexInContainer];
    addToArray(lContainer, CONTAINER_HEADER_OFFSET + index, lView);
  } else {
    lContainer.push(lView);
    lView[NEXT] = null;
  }
  lView[PARENT] = lContainer;
  const declarationLContainer = lView[DECLARATION_LCONTAINER];
  if (declarationLContainer !== null && lContainer !== declarationLContainer) {
    trackMovedView(declarationLContainer, lView);
  }
  const lQueries = lView[QUERIES];
  if (lQueries !== null) {
    lQueries.insertView(tView);
  }
  updateAncestorTraversalFlagsOnAttach(lView);
  lView[FLAGS] |= 128;
}
function trackMovedView(declarationContainer, lView) {
  ngDevMode && assertDefined(lView, "LView required");
  ngDevMode && assertLContainer(declarationContainer);
  const movedViews = declarationContainer[MOVED_VIEWS];
  const parent = lView[PARENT];
  ngDevMode && assertDefined(parent, "missing parent");
  if (isLView(parent)) {
    declarationContainer[FLAGS] |= 2;
  } else {
    const insertedComponentLView = parent[PARENT][DECLARATION_COMPONENT_VIEW];
    ngDevMode && assertDefined(insertedComponentLView, "Missing insertedComponentLView");
    const declaredComponentLView = lView[DECLARATION_COMPONENT_VIEW];
    ngDevMode && assertDefined(declaredComponentLView, "Missing declaredComponentLView");
    if (declaredComponentLView !== insertedComponentLView) {
      declarationContainer[FLAGS] |= 2;
    }
  }
  if (movedViews === null) {
    declarationContainer[MOVED_VIEWS] = [lView];
  } else {
    movedViews.push(lView);
  }
}
var ViewRef = class {
  _lView;
  _cdRefInjectingView;
  _appRef = null;
  _attachedToViewContainer = false;
  exhaustive;
  get rootNodes() {
    const lView = this._lView;
    const tView = lView[TVIEW];
    return collectNativeNodes(tView, lView, tView.firstChild, []);
  }
  constructor(_lView, _cdRefInjectingView) {
    this._lView = _lView;
    this._cdRefInjectingView = _cdRefInjectingView;
  }
  get context() {
    return this._lView[CONTEXT];
  }
  set context(value) {
    if (ngDevMode) {
      console.warn("Angular: Replacing the `context` object of an `EmbeddedViewRef` is deprecated.");
    }
    this._lView[CONTEXT] = value;
  }
  get destroyed() {
    return isDestroyed(this._lView);
  }
  destroy() {
    if (this._appRef) {
      this._appRef.detachView(this);
    } else if (this._attachedToViewContainer) {
      const parent = this._lView[PARENT];
      if (isLContainer(parent)) {
        const viewRefs = parent[VIEW_REFS];
        const index = viewRefs ? viewRefs.indexOf(this) : -1;
        if (index > -1) {
          ngDevMode && assertEqual(index, parent.indexOf(this._lView) - CONTAINER_HEADER_OFFSET, "An attached view should be in the same position within its container as its ViewRef in the VIEW_REFS array.");
          detachView(parent, index);
          removeFromArray(viewRefs, index);
        }
      }
      this._attachedToViewContainer = false;
    }
    destroyLView(this._lView[TVIEW], this._lView);
  }
  onDestroy(callback) {
    storeLViewOnDestroy(this._lView, callback);
  }
  markForCheck() {
    markViewDirty(this._cdRefInjectingView || this._lView, 4);
  }
  detach() {
    this._lView[FLAGS] &= ~128;
  }
  reattach() {
    updateAncestorTraversalFlagsOnAttach(this._lView);
    this._lView[FLAGS] |= 128;
  }
  detectChanges() {
    this._lView[FLAGS] |= 1024;
    detectChangesInternal(this._lView);
  }
  checkNoChanges() {
    if (ngDevMode) {
      try {
        this.exhaustive ??= this._lView[INJECTOR].get(UseExhaustiveCheckNoChanges, USE_EXHAUSTIVE_CHECK_NO_CHANGES_DEFAULT);
      } catch {
        this.exhaustive = USE_EXHAUSTIVE_CHECK_NO_CHANGES_DEFAULT;
      }
      checkNoChangesInternal(this._lView, this.exhaustive);
    }
  }
  attachToViewContainerRef() {
    if (this._appRef) {
      throw new RuntimeError(902, ngDevMode && "This view is already attached directly to the ApplicationRef!");
    }
    this._attachedToViewContainer = true;
  }
  detachFromAppRef() {
    this._appRef = null;
    const isRoot = isRootView(this._lView);
    const declarationContainer = this._lView[DECLARATION_LCONTAINER];
    if (declarationContainer !== null && !isRoot) {
      detachMovedView(declarationContainer, this._lView);
    }
    detachViewFromDOM(this._lView[TVIEW], this._lView);
  }
  attachToAppRef(appRef) {
    if (this._attachedToViewContainer) {
      throw new RuntimeError(902, ngDevMode && "This view is already attached to a ViewContainer!");
    }
    this._appRef = appRef;
    const isRoot = isRootView(this._lView);
    const declarationContainer = this._lView[DECLARATION_LCONTAINER];
    if (declarationContainer !== null && !isRoot) {
      trackMovedView(declarationContainer, this._lView);
    }
    updateAncestorTraversalFlagsOnAttach(this._lView);
  }
};
function isViewDirty(view) {
  return requiresRefreshOrTraversal(view._lView) || !!(view._lView[FLAGS] & 64);
}
function markForRefresh(view) {
  markViewForRefresh(view._lView);
}
var TemplateRef = class {
  _declarationLView;
  _declarationTContainer;
  elementRef;
  static __NG_ELEMENT_ID__ = injectTemplateRef;
  constructor(_declarationLView, _declarationTContainer, elementRef) {
    this._declarationLView = _declarationLView;
    this._declarationTContainer = _declarationTContainer;
    this.elementRef = elementRef;
  }
  get ssrId() {
    return this._declarationTContainer.tView?.ssrId || null;
  }
  createEmbeddedView(context, injector) {
    return this.createEmbeddedViewImpl(context, injector);
  }
  createEmbeddedViewImpl(context, injector, dehydratedView) {
    const embeddedLView = createAndRenderEmbeddedLView(this._declarationLView, this._declarationTContainer, context, {
      embeddedViewInjector: injector,
      dehydratedView
    });
    return new ViewRef(embeddedLView);
  }
};
function injectTemplateRef() {
  return createTemplateRef(getCurrentTNode(), getLView());
}
function createTemplateRef(hostTNode, hostLView) {
  if (hostTNode.type & 4) {
    ngDevMode && assertDefined(hostTNode.tView, "TView must be allocated");
    return new TemplateRef(hostLView, hostTNode, createElementRef(hostTNode, hostLView));
  }
  return null;
}
var AT_THIS_LOCATION = "<-- AT THIS LOCATION";
function getFriendlyStringFromTNodeType(tNodeType) {
  switch (tNodeType) {
    case 4:
      return "view container";
    case 2:
      return "element";
    case 8:
      return "ng-container";
    case 32:
      return "icu";
    case 64:
      return "i18n";
    case 16:
      return "projection";
    case 1:
      return "text";
    case 128:
      return "@let";
    default:
      return "<unknown>";
  }
}
function validateMatchingNode(node, nodeType, tagName, lView, tNode, isViewContainerAnchor = false) {
  if (!node || node.nodeType !== nodeType || node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() !== tagName?.toLowerCase()) {
    const expectedNode = shortRNodeDescription(nodeType, tagName, null);
    let header = `During hydration Angular expected ${expectedNode} but `;
    const hostComponentDef = getDeclarationComponentDef(lView);
    const componentClassName = hostComponentDef?.type?.name;
    const expectedDom = describeExpectedDom(lView, tNode, isViewContainerAnchor);
    const expected = `Angular expected this DOM:

${expectedDom}

`;
    let actual = "";
    const componentHostElement = unwrapRNode(lView[HOST]);
    if (!node) {
      header += `the node was not found.

`;
      markRNodeAsHavingHydrationMismatch(componentHostElement, expectedDom);
    } else {
      const actualNode = shortRNodeDescription(node.nodeType, node.tagName ?? null, node.textContent ?? null);
      header += `found ${actualNode}.

`;
      const actualDom = describeDomFromNode(node);
      actual = `Actual DOM is:

${actualDom}

`;
      markRNodeAsHavingHydrationMismatch(componentHostElement, expectedDom, actualDom);
    }
    const footer = getHydrationErrorFooter(componentClassName);
    const message = header + expected + actual + getHydrationAttributeNote() + footer;
    throw new RuntimeError(-500, message);
  }
}
function validateSiblingNodeExists(node) {
  validateNodeExists(node);
  if (!node.nextSibling) {
    const header = "During hydration Angular expected more sibling nodes to be present.\n\n";
    const actual = `Actual DOM is:

${describeDomFromNode(node)}

`;
    const footer = getHydrationErrorFooter();
    const message = header + actual + footer;
    markRNodeAsHavingHydrationMismatch(node, "", actual);
    throw new RuntimeError(-501, message);
  }
}
function validateNodeExists(node, lView = null, tNode = null) {
  if (!node) {
    const header = "During hydration, Angular expected an element to be present at this location.\n\n";
    let expected = "";
    let footer = "";
    if (lView !== null && tNode !== null) {
      expected = describeExpectedDom(lView, tNode, false);
      footer = getHydrationErrorFooter();
      markRNodeAsHavingHydrationMismatch(unwrapRNode(lView[HOST]), expected, "");
    }
    throw new RuntimeError(-502, `${header}${expected}

${footer}`);
  }
}
function nodeNotFoundError(lView, tNode) {
  const header = "During serialization, Angular was unable to find an element in the DOM:\n\n";
  const expected = `${describeExpectedDom(lView, tNode, false)}

`;
  const footer = getHydrationErrorFooter();
  throw new RuntimeError(-502, header + expected + footer);
}
function nodeNotFoundAtPathError(host, path) {
  const header = `During hydration Angular was unable to locate a node using the "${path}" path, starting from the ${describeRNode(host)} node.

`;
  const footer = getHydrationErrorFooter();
  markRNodeAsHavingHydrationMismatch(host);
  throw new RuntimeError(-502, header + footer);
}
function unsupportedProjectionOfDomNodes(rNode) {
  const header = "During serialization, Angular detected DOM nodes that were created outside of Angular context and provided as projectable nodes (likely via `ViewContainerRef.createComponent` or `createComponent` APIs). Hydration is not supported for such cases, consider refactoring the code to avoid this pattern or using `ngSkipHydration` on the host element of the component.\n\n";
  const actual = `${describeDomFromNode(rNode)}

`;
  const message = header + actual + getHydrationAttributeNote();
  return new RuntimeError(-503, message);
}
function invalidSkipHydrationHost(rNode) {
  const header = "The `ngSkipHydration` flag is applied on a node that doesn't act as a component host. Hydration can be skipped only on per-component basis.\n\n";
  const actual = `${describeDomFromNode(rNode)}

`;
  const footer = "Please move the `ngSkipHydration` attribute to the component host element.\n\n";
  const message = header + actual + footer;
  return new RuntimeError(-504, message);
}
function stringifyTNodeAttrs(tNode) {
  const results = [];
  if (tNode.attrs) {
    for (let i = 0; i < tNode.attrs.length; ) {
      const attrName = tNode.attrs[i++];
      if (typeof attrName == "number") {
        break;
      }
      const attrValue = tNode.attrs[i++];
      results.push(`${attrName}="${shorten(attrValue)}"`);
    }
  }
  return results.join(" ");
}
var internalAttrs = /* @__PURE__ */ new Set(["ngh", "ng-version", "ng-server-context"]);
function stringifyRNodeAttrs(rNode) {
  const results = [];
  for (let i = 0; i < rNode.attributes.length; i++) {
    const attr = rNode.attributes[i];
    if (internalAttrs.has(attr.name)) continue;
    results.push(`${attr.name}="${shorten(attr.value)}"`);
  }
  return results.join(" ");
}
function describeTNode(tNode, innerContent = "…") {
  switch (tNode.type) {
    case 1:
      const content = tNode.value ? `(${tNode.value})` : "";
      return `#text${content}`;
    case 2:
      const attrs = stringifyTNodeAttrs(tNode);
      const tag = tNode.value.toLowerCase();
      return `<${tag}${attrs ? " " + attrs : ""}>${innerContent}</${tag}>`;
    case 8:
      return "<!-- ng-container -->";
    case 4:
      return "<!-- container -->";
    default:
      const typeAsString = getFriendlyStringFromTNodeType(tNode.type);
      return `#node(${typeAsString})`;
  }
}
function describeRNode(rNode, innerContent = "…") {
  const node = rNode;
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      const tag = node.tagName.toLowerCase();
      const attrs = stringifyRNodeAttrs(node);
      return `<${tag}${attrs ? " " + attrs : ""}>${innerContent}</${tag}>`;
    case Node.TEXT_NODE:
      const content = node.textContent ? shorten(node.textContent) : "";
      return `#text${content ? `(${content})` : ""}`;
    case Node.COMMENT_NODE:
      return `<!-- ${shorten(node.textContent ?? "")} -->`;
    default:
      return `#node(${node.nodeType})`;
  }
}
function describeExpectedDom(lView, tNode, isViewContainerAnchor) {
  const spacer = "  ";
  let content = "";
  if (tNode.prev) {
    content += spacer + "…\n";
    content += spacer + describeTNode(tNode.prev) + "\n";
  } else if (tNode.type && tNode.type & 12) {
    content += spacer + "…\n";
  }
  if (isViewContainerAnchor) {
    content += spacer + describeTNode(tNode) + "\n";
    content += spacer + `<!-- container -->  ${AT_THIS_LOCATION}
`;
  } else {
    content += spacer + describeTNode(tNode) + `  ${AT_THIS_LOCATION}
`;
  }
  content += spacer + "…\n";
  const parentRNode = tNode.type ? getParentRElement(lView[TVIEW], tNode, lView) : null;
  if (parentRNode) {
    content = describeRNode(parentRNode, "\n" + content);
  }
  return content;
}
function describeDomFromNode(node) {
  const spacer = "  ";
  let content = "";
  const currentNode = node;
  if (currentNode.previousSibling) {
    content += spacer + "…\n";
    content += spacer + describeRNode(currentNode.previousSibling) + "\n";
  }
  content += spacer + describeRNode(currentNode) + `  ${AT_THIS_LOCATION}
`;
  if (node.nextSibling) {
    content += spacer + "…\n";
  }
  if (node.parentNode) {
    content = describeRNode(currentNode.parentNode, "\n" + content);
  }
  return content;
}
function shortRNodeDescription(nodeType, tagName, textContent) {
  switch (nodeType) {
    case Node.ELEMENT_NODE:
      return `<${tagName.toLowerCase()}>`;
    case Node.TEXT_NODE:
      const content = textContent ? ` (with the "${shorten(textContent)}" content)` : "";
      return `a text node${content}`;
    case Node.COMMENT_NODE:
      return "a comment node";
    default:
      return `#node(nodeType=${nodeType})`;
  }
}
function getHydrationErrorFooter(componentClassName) {
  const componentInfo = componentClassName ? `the "${componentClassName}"` : "corresponding";
  return `To fix this problem:
  * check ${componentInfo} component for hydration-related issues
  * check to see if your template has valid HTML structure
  * or skip hydration by adding the \`ngSkipHydration\` attribute to its host node in a template

`;
}
function getHydrationAttributeNote() {
  return "Note: attributes are only displayed to better represent the DOM but have no effect on hydration mismatches.\n\n";
}
function stripNewlines(input2) {
  return input2.replace(/\s+/gm, "");
}
function shorten(input2, maxLength = 50) {
  if (!input2) {
    return "";
  }
  input2 = stripNewlines(input2);
  return input2.length > maxLength ? `${input2.substring(0, maxLength - 1)}…` : input2;
}
function getInsertInFrontOfRNodeWithI18n(parentTNode, currentTNode, lView) {
  const tNodeInsertBeforeIndex = currentTNode.insertBeforeIndex;
  const insertBeforeIndex = Array.isArray(tNodeInsertBeforeIndex) ? tNodeInsertBeforeIndex[0] : tNodeInsertBeforeIndex;
  if (insertBeforeIndex === null) {
    return getInsertInFrontOfRNodeWithNoI18n(parentTNode, currentTNode, lView);
  } else {
    ngDevMode && assertIndexInRange(lView, insertBeforeIndex);
    return unwrapRNode(lView[insertBeforeIndex]);
  }
}
function processI18nInsertBefore(renderer, childTNode, lView, childRNode, parentRElement) {
  const tNodeInsertBeforeIndex = childTNode.insertBeforeIndex;
  if (Array.isArray(tNodeInsertBeforeIndex)) {
    ngDevMode && assertDomNode(childRNode);
    let i18nParent = childRNode;
    let anchorRNode = null;
    if (!(childTNode.type & 3)) {
      anchorRNode = i18nParent;
      i18nParent = parentRElement;
    }
    if (i18nParent !== null && childTNode.componentOffset === -1) {
      for (let i = 1; i < tNodeInsertBeforeIndex.length; i++) {
        const i18nChild = lView[tNodeInsertBeforeIndex[i]];
        nativeInsertBefore(renderer, i18nParent, i18nChild, anchorRNode, false);
      }
    }
  }
}
function getOrCreateTNode(tView, index, type, name, attrs) {
  ngDevMode && index !== 0 && assertGreaterThanOrEqual(index, HEADER_OFFSET, "TNodes can't be in the LView header.");
  ngDevMode && assertPureTNodeType(type);
  let tNode = tView.data[index];
  if (tNode === null) {
    tNode = createTNodeAtIndex(tView, index, type, name, attrs);
    if (isInI18nBlock()) {
      tNode.flags |= 32;
    }
  } else if (tNode.type & 64) {
    tNode.type = type;
    tNode.value = name;
    tNode.attrs = attrs;
    const parent = getCurrentParentTNode();
    tNode.injectorIndex = parent === null ? -1 : parent.injectorIndex;
    ngDevMode && assertTNodeForTView(tNode, tView);
    ngDevMode && assertEqual(index, tNode.index, "Expecting same index");
  }
  setCurrentTNode(tNode, true);
  return tNode;
}
function createTNodeAtIndex(tView, index, type, name, attrs) {
  const currentTNode = getCurrentTNodePlaceholderOk();
  const isParent = isCurrentTNodeParent();
  const parent = isParent ? currentTNode : currentTNode && currentTNode.parent;
  const tNode = tView.data[index] = createTNode(tView, parent, type, index, name, attrs);
  linkTNodeInTView(tView, tNode, currentTNode, isParent);
  return tNode;
}
function linkTNodeInTView(tView, tNode, currentTNode, isParent) {
  if (tView.firstChild === null) {
    tView.firstChild = tNode;
  }
  if (currentTNode !== null) {
    if (isParent) {
      if (currentTNode.child == null && tNode.parent !== null) {
        currentTNode.child = tNode;
      }
    } else {
      if (currentTNode.next === null) {
        currentTNode.next = tNode;
        tNode.prev = currentTNode;
      }
    }
  }
}
function createTNode(tView, tParent, type, index, value, attrs) {
  ngDevMode && index !== 0 && assertGreaterThanOrEqual(index, HEADER_OFFSET, "TNodes can't be in the LView header.");
  ngDevMode && assertNotSame(attrs, void 0, "'undefined' is not valid value for 'attrs'");
  ngDevMode && tParent && assertTNodeForTView(tParent, tView);
  let injectorIndex = tParent ? tParent.injectorIndex : -1;
  let flags = 0;
  if (isInSkipHydrationBlock()) {
    flags |= 128;
  }
  const tNode = {
    type,
    index,
    insertBeforeIndex: null,
    injectorIndex,
    directiveStart: -1,
    directiveEnd: -1,
    directiveStylingLast: -1,
    componentOffset: -1,
    fieldIndex: -1,
    customControlIndex: -1,
    propertyBindings: null,
    flags,
    providerIndexes: 0,
    value,
    attrs,
    mergedAttrs: null,
    localNames: null,
    initialInputs: null,
    inputs: null,
    hostDirectiveInputs: null,
    outputs: null,
    hostDirectiveOutputs: null,
    directiveToIndex: null,
    tView: null,
    next: null,
    prev: null,
    projectionNext: null,
    child: null,
    parent: tParent,
    projection: null,
    styles: null,
    stylesWithoutHost: null,
    residualStyles: void 0,
    classes: null,
    classesWithoutHost: null,
    residualClasses: void 0,
    classBindings: 0,
    styleBindings: 0
  };
  if (ngDevMode) {
    Object.seal(tNode);
  }
  return tNode;
}
function addTNodeAndUpdateInsertBeforeIndex(previousTNodes, newTNode) {
  ngDevMode && assertEqual(newTNode.insertBeforeIndex, null, "We expect that insertBeforeIndex is not set");
  previousTNodes.push(newTNode);
  if (previousTNodes.length > 1) {
    for (let i = previousTNodes.length - 2; i >= 0; i--) {
      const existingTNode = previousTNodes[i];
      if (!isI18nText(existingTNode)) {
        if (isNewTNodeCreatedBefore(existingTNode, newTNode) && getInsertBeforeIndex(existingTNode) === null) {
          setInsertBeforeIndex(existingTNode, newTNode.index);
        }
      }
    }
  }
}
function isI18nText(tNode) {
  return !(tNode.type & 64);
}
function isNewTNodeCreatedBefore(existingTNode, newTNode) {
  return isI18nText(newTNode) || existingTNode.index > newTNode.index;
}
function getInsertBeforeIndex(tNode) {
  const index = tNode.insertBeforeIndex;
  return Array.isArray(index) ? index[0] : index;
}
function setInsertBeforeIndex(tNode, value) {
  const index = tNode.insertBeforeIndex;
  if (Array.isArray(index)) {
    index[0] = value;
  } else {
    setI18nHandling(getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore);
    tNode.insertBeforeIndex = value;
  }
}
function getTIcu(tView, index) {
  const value = tView.data[index];
  if (value === null || typeof value === "string") return null;
  if (ngDevMode && !(value.hasOwnProperty("tView") || value.hasOwnProperty("currentCaseLViewIndex"))) {
    throwError("We expect to get 'null'|'TIcu'|'TIcuContainer', but got: " + value);
  }
  const tIcu = value.hasOwnProperty("currentCaseLViewIndex") ? value : value.value;
  ngDevMode && assertTIcu(tIcu);
  return tIcu;
}
function setTIcu(tView, index, tIcu) {
  const tNode = tView.data[index];
  ngDevMode && assertEqual(tNode === null || tNode.hasOwnProperty("tView"), true, "We expect to get 'null'|'TIcuContainer'");
  if (tNode === null) {
    tView.data[index] = tIcu;
  } else {
    ngDevMode && assertTNodeType(tNode, 32);
    tNode.value = tIcu;
  }
}
function setTNodeInsertBeforeIndex(tNode, index) {
  ngDevMode && assertTNode(tNode);
  let insertBeforeIndex = tNode.insertBeforeIndex;
  if (insertBeforeIndex === null) {
    setI18nHandling(getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore);
    insertBeforeIndex = tNode.insertBeforeIndex = [null, index];
  } else {
    assertEqual(Array.isArray(insertBeforeIndex), true, "Expecting array here");
    insertBeforeIndex.push(index);
  }
}
function createTNodePlaceholder(tView, previousTNodes, index) {
  const tNode = createTNodeAtIndex(tView, index, 64, null, null);
  addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tNode);
  return tNode;
}
function getCurrentICUCaseIndex(tIcu, lView) {
  const currentCase = lView[tIcu.currentCaseLViewIndex];
  return currentCase === null ? currentCase : currentCase < 0 ? ~currentCase : currentCase;
}
function getParentFromIcuCreateOpCode(mergedCode) {
  return mergedCode >>> 17;
}
function getRefFromIcuCreateOpCode(mergedCode) {
  return (mergedCode & 131070) >>> 1;
}
function getInstructionFromIcuCreateOpCode(mergedCode) {
  return mergedCode & 1;
}
function icuCreateOpCode(opCode, parentIdx, refIdx) {
  ngDevMode && assertGreaterThanOrEqual(parentIdx, 0, "Missing parent index");
  ngDevMode && assertGreaterThan(refIdx, 0, "Missing ref index");
  return opCode | parentIdx << 17 | refIdx << 1;
}
function isRootTemplateMessage(subTemplateIndex) {
  return subTemplateIndex === -1;
}
function enterIcu(state, tIcu, lView) {
  state.index = 0;
  const currentCase = getCurrentICUCaseIndex(tIcu, lView);
  if (currentCase !== null) {
    ngDevMode && assertNumberInRange(currentCase, 0, tIcu.cases.length - 1);
    state.removes = tIcu.remove[currentCase];
  } else {
    state.removes = EMPTY_ARRAY;
  }
}
function icuContainerIteratorNext(state) {
  if (state.index < state.removes.length) {
    const removeOpCode = state.removes[state.index++];
    ngDevMode && assertNumber(removeOpCode, "Expecting OpCode number");
    if (removeOpCode > 0) {
      const rNode = state.lView[removeOpCode];
      ngDevMode && assertDomNode(rNode);
      return rNode;
    } else {
      state.stack.push(state.index, state.removes);
      const tIcuIndex = ~removeOpCode;
      const tIcu = state.lView[TVIEW].data[tIcuIndex];
      ngDevMode && assertTIcu(tIcu);
      enterIcu(state, tIcu, state.lView);
      return icuContainerIteratorNext(state);
    }
  } else {
    if (state.stack.length === 0) {
      state.lView = void 0;
      return null;
    } else {
      state.removes = state.stack.pop();
      state.index = state.stack.pop();
      return icuContainerIteratorNext(state);
    }
  }
}
function loadIcuContainerVisitor() {
  const _state = {
    stack: [],
    index: -1
  };
  function icuContainerIteratorStart(tIcuContainerNode, lView) {
    _state.lView = lView;
    while (_state.stack.length) _state.stack.pop();
    ngDevMode && assertTNodeForLView(tIcuContainerNode, lView);
    enterIcu(_state, tIcuContainerNode.value, lView);
    return icuContainerIteratorNext.bind(null, _state);
  }
  return icuContainerIteratorStart;
}
function createIcuIterator(tIcu, lView) {
  const state = {
    stack: [],
    index: -1,
    lView
  };
  ngDevMode && assertTIcu(tIcu);
  enterIcu(state, tIcu, lView);
  return icuContainerIteratorNext.bind(null, state);
}
var REF_EXTRACTOR_REGEXP = (() => {
  return new RegExp(`^(\\d+)*(${REFERENCE_NODE_BODY}|${REFERENCE_NODE_HOST})*(.*)`);
})();
function compressNodeLocation(referenceNode, path) {
  const result = [referenceNode];
  for (const segment of path) {
    const lastIdx = result.length - 1;
    if (lastIdx > 0 && result[lastIdx - 1] === segment) {
      const value = result[lastIdx] || 1;
      result[lastIdx] = value + 1;
    } else {
      result.push(segment, "");
    }
  }
  return result.join("");
}
function decompressNodeLocation(path) {
  const matches = path.match(REF_EXTRACTOR_REGEXP);
  const [_, refNodeId, refNodeName, rest] = matches;
  const ref = refNodeId ? parseInt(refNodeId, 10) : refNodeName;
  const steps = [];
  for (const [_2, step, count] of rest.matchAll(/(f|n)(\d*)/g)) {
    const repeat = parseInt(count, 10) || 1;
    steps.push(step, repeat);
  }
  return [ref, ...steps];
}
function isFirstElementInNgContainer(tNode) {
  return !tNode.prev && tNode.parent?.type === 8;
}
function getNoOffsetIndex(tNode) {
  return tNode.index - HEADER_OFFSET;
}
function isDisconnectedNode(tNode, lView) {
  return !(tNode.type & (16 | 128)) && !!lView[tNode.index] && isDisconnectedRNode(unwrapRNode(lView[tNode.index]));
}
function isDisconnectedRNode(rNode) {
  return !!rNode && !rNode.isConnected;
}
function locateI18nRNodeByIndex(hydrationInfo, noOffsetIndex) {
  const i18nNodes = hydrationInfo.i18nNodes;
  if (i18nNodes) {
    return i18nNodes.get(noOffsetIndex);
  }
  return void 0;
}
function tryLocateRNodeByPath(hydrationInfo, lView, noOffsetIndex) {
  const nodes = hydrationInfo.data[NODES];
  const path = nodes?.[noOffsetIndex];
  return path ? locateRNodeByPath(path, lView) : null;
}
function locateNextRNode(hydrationInfo, tView, lView, tNode) {
  const noOffsetIndex = getNoOffsetIndex(tNode);
  let native = locateI18nRNodeByIndex(hydrationInfo, noOffsetIndex);
  if (native === void 0) {
    const nodes = hydrationInfo.data[NODES];
    if (nodes?.[noOffsetIndex]) {
      native = locateRNodeByPath(nodes[noOffsetIndex], lView);
    } else if (tView.firstChild === tNode) {
      native = hydrationInfo.firstChild;
    } else {
      const previousTNodeParent = tNode.prev === null;
      const previousTNode = tNode.prev ?? tNode.parent;
      ngDevMode && assertDefined(previousTNode, "Unexpected state: current TNode does not have a connection to the previous node or a parent node.");
      if (isFirstElementInNgContainer(tNode)) {
        const noOffsetParentIndex = getNoOffsetIndex(tNode.parent);
        native = getSegmentHead(hydrationInfo, noOffsetParentIndex);
      } else {
        let previousRElement = getNativeByTNode(previousTNode, lView);
        if (previousTNodeParent) {
          native = previousRElement.firstChild;
        } else {
          const noOffsetPrevSiblingIndex = getNoOffsetIndex(previousTNode);
          const segmentHead = getSegmentHead(hydrationInfo, noOffsetPrevSiblingIndex);
          if (previousTNode.type === 2 && segmentHead) {
            const numRootNodesToSkip = calcSerializedContainerSize(hydrationInfo, noOffsetPrevSiblingIndex);
            const nodesToSkip = numRootNodesToSkip + 1;
            native = siblingAfter(nodesToSkip, segmentHead);
          } else {
            native = previousRElement.nextSibling;
          }
        }
      }
    }
  }
  return native;
}
function siblingAfter(skip, from) {
  let currentNode = from;
  for (let i = 0; i < skip; i++) {
    ngDevMode && validateSiblingNodeExists(currentNode);
    currentNode = currentNode.nextSibling;
  }
  return currentNode;
}
function stringifyNavigationInstructions(instructions) {
  const container = [];
  for (let i = 0; i < instructions.length; i += 2) {
    const step = instructions[i];
    const repeat = instructions[i + 1];
    for (let r = 0; r < repeat; r++) {
      container.push(step === NODE_NAVIGATION_STEP_FIRST_CHILD ? "firstChild" : "nextSibling");
    }
  }
  return container.join(".");
}
function navigateToNode(from, instructions) {
  let node = from;
  for (let i = 0; i < instructions.length; i += 2) {
    const step = instructions[i];
    const repeat = instructions[i + 1];
    for (let r = 0; r < repeat; r++) {
      if (ngDevMode && !node) {
        throw nodeNotFoundAtPathError(from, stringifyNavigationInstructions(instructions));
      }
      switch (step) {
        case NODE_NAVIGATION_STEP_FIRST_CHILD:
          node = node.firstChild;
          break;
        case NODE_NAVIGATION_STEP_NEXT_SIBLING:
          node = node.nextSibling;
          break;
      }
    }
  }
  if (ngDevMode && !node) {
    throw nodeNotFoundAtPathError(from, stringifyNavigationInstructions(instructions));
  }
  return node;
}
function locateRNodeByPath(path, lView) {
  const [referenceNode, ...navigationInstructions] = decompressNodeLocation(path);
  let ref;
  if (referenceNode === REFERENCE_NODE_HOST) {
    ref = lView[DECLARATION_COMPONENT_VIEW][HOST];
  } else if (referenceNode === REFERENCE_NODE_BODY) {
    ref = ɵɵresolveBody(lView[DECLARATION_COMPONENT_VIEW][HOST]);
  } else {
    const parentElementId = Number(referenceNode);
    ref = unwrapRNode(lView[parentElementId + HEADER_OFFSET]);
  }
  return navigateToNode(ref, navigationInstructions);
}
function navigateBetween(start, finish) {
  if (start === finish) {
    return [];
  } else if (start.parentElement == null || finish.parentElement == null) {
    return null;
  } else if (start.parentElement === finish.parentElement) {
    return navigateBetweenSiblings(start, finish);
  } else {
    const parent = finish.parentElement;
    const parentPath = navigateBetween(start, parent);
    const childPath = navigateBetween(parent.firstChild, finish);
    if (!parentPath || !childPath) return null;
    return [...parentPath, NODE_NAVIGATION_STEP_FIRST_CHILD, ...childPath];
  }
}
function navigateBetweenSiblings(start, finish) {
  const nav = [];
  let node = null;
  for (node = start; node != null && node !== finish; node = node.nextSibling) {
    nav.push(NODE_NAVIGATION_STEP_NEXT_SIBLING);
  }
  return node == null ? null : nav;
}
function calcPathBetween(from, to, fromNodeName) {
  const path = navigateBetween(from, to);
  return path === null ? null : compressNodeLocation(fromNodeName, path);
}
function calcPathForNode(tNode, lView, excludedParentNodes) {
  let parentTNode = tNode.parent;
  let parentIndex;
  let parentRNode;
  let referenceNodeName;
  while (parentTNode !== null && (isDisconnectedNode(parentTNode, lView) || excludedParentNodes?.has(parentTNode.index))) {
    parentTNode = parentTNode.parent;
  }
  if (parentTNode === null || !(parentTNode.type & 3)) {
    parentIndex = referenceNodeName = REFERENCE_NODE_HOST;
    parentRNode = lView[DECLARATION_COMPONENT_VIEW][HOST];
  } else {
    parentIndex = parentTNode.index;
    parentRNode = unwrapRNode(lView[parentIndex]);
    referenceNodeName = renderStringify(parentIndex - HEADER_OFFSET);
  }
  let rNode = unwrapRNode(lView[tNode.index]);
  if (tNode.type & (12 | 32)) {
    const firstRNode = getFirstNativeNode(lView, tNode);
    if (firstRNode) {
      rNode = firstRNode;
    }
  }
  let path = calcPathBetween(parentRNode, rNode, referenceNodeName);
  if (path === null && parentRNode !== rNode) {
    const body = parentRNode.ownerDocument.body;
    path = calcPathBetween(body, rNode, REFERENCE_NODE_BODY);
    if (path === null) {
      throw nodeNotFoundError(lView, tNode);
    }
  }
  return path;
}
function gatherDeferBlocksCommentNodes(doc, node) {
  const commentNodesIterator = doc.createNodeIterator(node, NodeFilter.SHOW_COMMENT, {
    acceptNode
  });
  let currentNode;
  const nodesByBlockId = /* @__PURE__ */ new Map();
  while (currentNode = commentNodesIterator.nextNode()) {
    const nghPattern = "ngh=";
    const content = currentNode?.textContent;
    const nghIdx = content?.indexOf(nghPattern) ?? -1;
    if (nghIdx > -1) {
      const nghValue = content.substring(nghIdx + nghPattern.length).trim();
      ngDevMode && assertEqual(nghValue.startsWith("d"), true, "Invalid defer block id found in a comment node.");
      nodesByBlockId.set(nghValue, currentNode);
    }
  }
  return nodesByBlockId;
}
function acceptNode(node) {
  return node.textContent?.trimStart().startsWith("ngh=") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
}
var _isI18nHydrationSupportEnabled = false;
var _prepareI18nBlockForHydrationImpl = () => {
};
function setIsI18nHydrationSupportEnabled(enabled) {
  _isI18nHydrationSupportEnabled = enabled;
}
function isI18nHydrationSupportEnabled() {
  return _isI18nHydrationSupportEnabled;
}
function prepareI18nBlockForHydration(lView, index, parentTNode, subTemplateIndex) {
  _prepareI18nBlockForHydrationImpl(lView, index, parentTNode, subTemplateIndex);
}
function enablePrepareI18nBlockForHydrationImpl() {
  _prepareI18nBlockForHydrationImpl = prepareI18nBlockForHydrationImpl;
}
function isI18nHydrationEnabled(injector) {
  injector = injector ?? inject(Injector);
  return injector.get(IS_I18N_HYDRATION_ENABLED, false);
}
function getOrComputeI18nChildren(tView, context) {
  let i18nChildren = context.i18nChildren.get(tView);
  if (i18nChildren === void 0) {
    i18nChildren = collectI18nChildren(tView);
    context.i18nChildren.set(tView, i18nChildren);
  }
  return i18nChildren;
}
function collectI18nChildren(tView) {
  const children = /* @__PURE__ */ new Set();
  function collectI18nViews(node) {
    children.add(node.index);
    switch (node.kind) {
      case 1:
      case 2: {
        for (const childNode of node.children) {
          collectI18nViews(childNode);
        }
        break;
      }
      case 3: {
        for (const caseNodes of node.cases) {
          for (const caseNode of caseNodes) {
            collectI18nViews(caseNode);
          }
        }
        break;
      }
    }
  }
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    const tI18n = tView.data[i];
    if (!tI18n || !tI18n.ast) {
      continue;
    }
    for (const node of tI18n.ast) {
      collectI18nViews(node);
    }
  }
  return children.size === 0 ? null : children;
}
function trySerializeI18nBlock(lView, index, context) {
  if (!context.isI18nHydrationEnabled) {
    return null;
  }
  const tView = lView[TVIEW];
  const tI18n = tView.data[index];
  if (!tI18n || !tI18n.ast) {
    return null;
  }
  const parentTNode = tView.data[tI18n.parentTNodeIndex];
  if (parentTNode && isI18nInSkipHydrationBlock(parentTNode)) {
    return null;
  }
  const serializedI18nBlock = {
    caseQueue: [],
    disconnectedNodes: /* @__PURE__ */ new Set(),
    disjointNodes: /* @__PURE__ */ new Set()
  };
  serializeI18nBlock(lView, serializedI18nBlock, context, tI18n.ast);
  return serializedI18nBlock.caseQueue.length === 0 && serializedI18nBlock.disconnectedNodes.size === 0 && serializedI18nBlock.disjointNodes.size === 0 ? null : serializedI18nBlock;
}
function serializeI18nBlock(lView, serializedI18nBlock, context, nodes) {
  let prevRNode = null;
  for (const node of nodes) {
    const nextRNode = serializeI18nNode(lView, serializedI18nBlock, context, node);
    if (nextRNode) {
      if (isDisjointNode(prevRNode, nextRNode)) {
        serializedI18nBlock.disjointNodes.add(node.index - HEADER_OFFSET);
      }
      prevRNode = nextRNode;
    }
  }
  return prevRNode;
}
function isDisjointNode(prevNode, nextNode) {
  return prevNode && prevNode.nextSibling !== nextNode;
}
function serializeI18nNode(lView, serializedI18nBlock, context, node) {
  const maybeRNode = unwrapRNode(lView[node.index]);
  if (!maybeRNode || isDisconnectedRNode(maybeRNode)) {
    serializedI18nBlock.disconnectedNodes.add(node.index - HEADER_OFFSET);
    return null;
  }
  const rNode = maybeRNode;
  switch (node.kind) {
    case 0: {
      processTextNodeBeforeSerialization(context, rNode);
      break;
    }
    case 1:
    case 2: {
      serializeI18nBlock(lView, serializedI18nBlock, context, node.children);
      break;
    }
    case 3: {
      const currentCase = lView[node.currentCaseLViewIndex];
      if (currentCase != null) {
        const caseIdx = currentCase < 0 ? ~currentCase : currentCase;
        serializedI18nBlock.caseQueue.push(caseIdx);
        serializeI18nBlock(lView, serializedI18nBlock, context, node.cases[caseIdx]);
      }
      break;
    }
  }
  return getFirstNativeNodeForI18nNode(lView, node);
}
function getFirstNativeNodeForI18nNode(lView, node) {
  const tView = lView[TVIEW];
  const maybeTNode = tView.data[node.index];
  if (isTNodeShape(maybeTNode)) {
    return getFirstNativeNode(lView, maybeTNode);
  } else if (node.kind === 3) {
    const icuIterator = createIcuIterator(maybeTNode, lView);
    let rNode = icuIterator();
    return rNode ?? unwrapRNode(lView[node.index]);
  } else {
    return unwrapRNode(lView[node.index]) ?? null;
  }
}
function setCurrentNode(state, node) {
  state.currentNode = node;
}
function appendI18nNodeToCollection(context, state, astNode) {
  const noOffsetIndex = astNode.index - HEADER_OFFSET;
  const {
    disconnectedNodes
  } = context;
  const currentNode = state.currentNode;
  if (state.isConnected) {
    context.i18nNodes.set(noOffsetIndex, currentNode);
    disconnectedNodes.delete(noOffsetIndex);
  } else {
    disconnectedNodes.add(noOffsetIndex);
  }
  return currentNode;
}
function skipSiblingNodes(state, skip) {
  let currentNode = state.currentNode;
  for (let i = 0; i < skip; i++) {
    if (!currentNode) {
      break;
    }
    currentNode = currentNode?.nextSibling ?? null;
  }
  return currentNode;
}
function forkHydrationState(state, nextNode) {
  return {
    currentNode: nextNode,
    isConnected: state.isConnected
  };
}
function prepareI18nBlockForHydrationImpl(lView, index, parentTNode, subTemplateIndex) {
  const hydrationInfo = lView[HYDRATION];
  if (!hydrationInfo) {
    return;
  }
  if (!isI18nHydrationSupportEnabled() || parentTNode && (isI18nInSkipHydrationBlock(parentTNode) || isDisconnectedNode$1(hydrationInfo, parentTNode.index - HEADER_OFFSET))) {
    return;
  }
  const tView = lView[TVIEW];
  const tI18n = tView.data[index];
  ngDevMode && assertDefined(tI18n, "Expected i18n data to be present in a given TView slot during hydration");
  function findHydrationRoot() {
    if (isRootTemplateMessage(subTemplateIndex)) {
      ngDevMode && assertDefined(parentTNode, "Expected parent TNode while hydrating i18n root");
      const rootNode = locateNextRNode(hydrationInfo, tView, lView, parentTNode);
      return parentTNode.type & 8 ? rootNode : rootNode.firstChild;
    }
    return hydrationInfo?.firstChild;
  }
  const currentNode = findHydrationRoot();
  ngDevMode && assertDefined(currentNode, "Expected root i18n node during hydration");
  const disconnectedNodes = initDisconnectedNodes(hydrationInfo) ?? /* @__PURE__ */ new Set();
  const i18nNodes = hydrationInfo.i18nNodes ??= /* @__PURE__ */ new Map();
  const caseQueue = hydrationInfo.data[I18N_DATA]?.[index - HEADER_OFFSET] ?? [];
  const dehydratedIcuData = hydrationInfo.dehydratedIcuData ??= /* @__PURE__ */ new Map();
  collectI18nNodesFromDom({
    hydrationInfo,
    lView,
    i18nNodes,
    disconnectedNodes,
    caseQueue,
    dehydratedIcuData
  }, {
    currentNode,
    isConnected: true
  }, tI18n.ast);
  hydrationInfo.disconnectedNodes = disconnectedNodes.size === 0 ? null : disconnectedNodes;
}
function collectI18nNodesFromDom(context, state, nodeOrNodes) {
  if (Array.isArray(nodeOrNodes)) {
    let nextState = state;
    for (const node of nodeOrNodes) {
      const targetNode = tryLocateRNodeByPath(context.hydrationInfo, context.lView, node.index - HEADER_OFFSET);
      if (targetNode) {
        nextState = forkHydrationState(state, targetNode);
      }
      collectI18nNodesFromDom(context, nextState, node);
    }
  } else {
    if (context.disconnectedNodes.has(nodeOrNodes.index - HEADER_OFFSET)) {
      return;
    }
    switch (nodeOrNodes.kind) {
      case 0: {
        const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
        setCurrentNode(state, currentNode?.nextSibling ?? null);
        break;
      }
      case 1: {
        collectI18nNodesFromDom(context, forkHydrationState(state, state.currentNode?.firstChild ?? null), nodeOrNodes.children);
        const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
        setCurrentNode(state, currentNode?.nextSibling ?? null);
        break;
      }
      case 2: {
        const noOffsetIndex = nodeOrNodes.index - HEADER_OFFSET;
        const {
          hydrationInfo
        } = context;
        const containerSize = getNgContainerSize(hydrationInfo, noOffsetIndex);
        switch (nodeOrNodes.type) {
          case 0: {
            const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
            if (isSerializedElementContainer(hydrationInfo, noOffsetIndex)) {
              collectI18nNodesFromDom(context, state, nodeOrNodes.children);
              const nextNode = skipSiblingNodes(state, 1);
              setCurrentNode(state, nextNode);
            } else {
              collectI18nNodesFromDom(context, forkHydrationState(state, state.currentNode?.firstChild ?? null), nodeOrNodes.children);
              setCurrentNode(state, currentNode?.nextSibling ?? null);
              if (containerSize !== null) {
                const nextNode = skipSiblingNodes(state, containerSize + 1);
                setCurrentNode(state, nextNode);
              }
            }
            break;
          }
          case 1: {
            ngDevMode && assertNotEqual(containerSize, null, "Expected a container size while hydrating i18n subtemplate");
            appendI18nNodeToCollection(context, state, nodeOrNodes);
            const nextNode = skipSiblingNodes(state, containerSize + 1);
            setCurrentNode(state, nextNode);
            break;
          }
        }
        break;
      }
      case 3: {
        const selectedCase = state.isConnected ? context.caseQueue.shift() : null;
        const childState = {
          currentNode: null,
          isConnected: false
        };
        for (let i = 0; i < nodeOrNodes.cases.length; i++) {
          collectI18nNodesFromDom(context, i === selectedCase ? state : childState, nodeOrNodes.cases[i]);
        }
        if (selectedCase !== null) {
          context.dehydratedIcuData.set(nodeOrNodes.index, {
            case: selectedCase,
            node: nodeOrNodes
          });
        }
        const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
        setCurrentNode(state, currentNode?.nextSibling ?? null);
        break;
      }
    }
  }
}
var _claimDehydratedIcuCaseImpl = () => {
};
function claimDehydratedIcuCase(lView, icuIndex, caseIndex) {
  _claimDehydratedIcuCaseImpl(lView, icuIndex, caseIndex);
}
function enableClaimDehydratedIcuCaseImpl() {
  _claimDehydratedIcuCaseImpl = claimDehydratedIcuCaseImpl;
}
function claimDehydratedIcuCaseImpl(lView, icuIndex, caseIndex) {
  const dehydratedIcuDataMap = lView[HYDRATION]?.dehydratedIcuData;
  if (dehydratedIcuDataMap) {
    const dehydratedIcuData = dehydratedIcuDataMap.get(icuIndex);
    if (dehydratedIcuData?.case === caseIndex) {
      dehydratedIcuDataMap.delete(icuIndex);
    }
  }
}
function cleanupI18nHydrationData(lView) {
  const hydrationInfo = lView[HYDRATION];
  if (hydrationInfo) {
    const {
      i18nNodes,
      dehydratedIcuData: dehydratedIcuDataMap
    } = hydrationInfo;
    if (i18nNodes && dehydratedIcuDataMap) {
      const renderer = lView[RENDERER];
      for (const dehydratedIcuData of dehydratedIcuDataMap.values()) {
        cleanupDehydratedIcuData(renderer, i18nNodes, dehydratedIcuData);
      }
    }
    hydrationInfo.i18nNodes = void 0;
    hydrationInfo.dehydratedIcuData = void 0;
  }
}
function cleanupDehydratedIcuData(renderer, i18nNodes, dehydratedIcuData) {
  for (const node of dehydratedIcuData.node.cases[dehydratedIcuData.case]) {
    const rNode = i18nNodes.get(node.index - HEADER_OFFSET);
    if (rNode) {
      nativeRemoveNode(renderer, rNode, false);
    }
  }
}
function removeDehydratedViews(lContainer) {
  const views = lContainer[DEHYDRATED_VIEWS] ?? [];
  const parentLView = lContainer[PARENT];
  const renderer = parentLView[RENDERER];
  const retainedViews = [];
  for (const view of views) {
    if (view.data[DEFER_BLOCK_ID] !== void 0) {
      retainedViews.push(view);
    } else {
      removeDehydratedView(view, renderer);
      ngDevMode && ngDevMode.dehydratedViewsRemoved++;
    }
  }
  lContainer[DEHYDRATED_VIEWS] = retainedViews;
}
function removeDehydratedViewList(deferBlock) {
  const {
    lContainer
  } = deferBlock;
  const dehydratedViews = lContainer[DEHYDRATED_VIEWS];
  if (dehydratedViews === null) return;
  const parentLView = lContainer[PARENT];
  const renderer = parentLView[RENDERER];
  for (const view of dehydratedViews) {
    removeDehydratedView(view, renderer);
    ngDevMode && ngDevMode.dehydratedViewsRemoved++;
  }
}
function removeDehydratedView(dehydratedView, renderer) {
  let nodesRemoved = 0;
  let currentRNode = dehydratedView.firstChild;
  if (currentRNode) {
    const numNodes = dehydratedView.data[NUM_ROOT_NODES];
    while (nodesRemoved < numNodes) {
      ngDevMode && validateSiblingNodeExists(currentRNode);
      const nextSibling = currentRNode.nextSibling;
      nativeRemoveNode(renderer, currentRNode, false);
      currentRNode = nextSibling;
      nodesRemoved++;
    }
  }
}
function cleanupLContainer(lContainer) {
  removeDehydratedViews(lContainer);
  const hostLView = lContainer[HOST];
  if (isLView(hostLView)) {
    cleanupLView(hostLView);
  }
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    cleanupLView(lContainer[i]);
  }
}
function cleanupLView(lView) {
  cleanupI18nHydrationData(lView);
  const tView = lView[TVIEW];
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    if (isLContainer(lView[i])) {
      const lContainer = lView[i];
      cleanupLContainer(lContainer);
    } else if (isLView(lView[i])) {
      cleanupLView(lView[i]);
    }
  }
}
function cleanupDehydratedViews(appRef) {
  const viewRefs = appRef._views;
  for (const viewRef of viewRefs) {
    const lNode = getLNodeForHydration(viewRef);
    if (lNode !== null && lNode[HOST] !== null) {
      if (isLView(lNode)) {
        cleanupLView(lNode);
      } else {
        cleanupLContainer(lNode);
      }
      ngDevMode && ngDevMode.dehydratedViewsCleanupRuns++;
    }
  }
}
function cleanupHydratedDeferBlocks(deferBlock, hydratedBlocks, registry, appRef) {
  if (deferBlock !== null) {
    registry.cleanup(hydratedBlocks);
    cleanupLContainer(deferBlock.lContainer);
    cleanupDehydratedViews(appRef);
  }
}
function locateDehydratedViewsInContainer(currentRNode, serializedViews) {
  const dehydratedViews = [];
  for (const serializedView of serializedViews) {
    for (let i = 0; i < (serializedView[MULTIPLIER] ?? 1); i++) {
      const view = {
        data: serializedView,
        firstChild: null
      };
      if (serializedView[NUM_ROOT_NODES] > 0) {
        view.firstChild = currentRNode;
        currentRNode = siblingAfter(serializedView[NUM_ROOT_NODES], currentRNode);
      }
      dehydratedViews.push(view);
    }
  }
  return [currentRNode, dehydratedViews];
}
var _findMatchingDehydratedViewImpl = () => null;
var _findAndReconcileMatchingDehydratedViewsImpl = () => null;
function enableFindMatchingDehydratedViewImpl() {
  _findMatchingDehydratedViewImpl = findMatchingDehydratedViewImpl;
  _findAndReconcileMatchingDehydratedViewsImpl = findAndReconcileMatchingDehydratedViewsImpl;
}
function findMatchingDehydratedViewImpl(lContainer, template) {
  if (hasMatchingDehydratedView(lContainer, template)) {
    return lContainer[DEHYDRATED_VIEWS].shift();
  } else {
    removeDehydratedViews(lContainer);
    return null;
  }
}
function findMatchingDehydratedView(lContainer, template) {
  return _findMatchingDehydratedViewImpl(lContainer, template);
}
function findAndReconcileMatchingDehydratedViewsImpl(lContainer, templateTNode, hostLView) {
  if (templateTNode.tView.ssrId === null) return null;
  const dehydratedView = findMatchingDehydratedView(lContainer, templateTNode.tView.ssrId);
  if (hostLView[TVIEW].firstUpdatePass && dehydratedView === null) {
    removeStaleDehydratedBranch(hostLView, templateTNode);
  }
  return dehydratedView;
}
function findAndReconcileMatchingDehydratedViews(lContainer, templateTNode, hostLView) {
  return _findAndReconcileMatchingDehydratedViewsImpl(lContainer, templateTNode, hostLView);
}
function removeStaleDehydratedBranch(hostLView, tNode) {
  let currentTNode = tNode;
  while (currentTNode) {
    if (cleanupMatchingDehydratedViews(hostLView, currentTNode)) return;
    if ((currentTNode.flags & 256) === 256) {
      break;
    }
    currentTNode = currentTNode.prev;
  }
  currentTNode = tNode.next;
  while (currentTNode) {
    if ((currentTNode.flags & 512) !== 512) {
      break;
    }
    if (cleanupMatchingDehydratedViews(hostLView, currentTNode)) return;
    currentTNode = currentTNode.next;
  }
}
function hasMatchingDehydratedView(lContainer, template) {
  const views = lContainer[DEHYDRATED_VIEWS];
  if (!template || views === null || views.length === 0) {
    return false;
  }
  return views[0].data[TEMPLATE_ID] === template;
}
function cleanupMatchingDehydratedViews(hostLView, currentTNode) {
  const ssrId = currentTNode.tView?.ssrId;
  if (ssrId == null) return false;
  const container = hostLView[currentTNode.index];
  if (isLContainer(container) && hasMatchingDehydratedView(container, ssrId)) {
    removeDehydratedViews(container);
    return true;
  }
  return false;
}
var ComponentRef$1 = class ComponentRef {
};
var ComponentFactory$1 = class ComponentFactory {
};
var _NullComponentFactoryResolver = class {
  resolveComponentFactory(component) {
    throw new RuntimeError(917, typeof ngDevMode !== "undefined" && ngDevMode && `No component factory found for ${stringify(component)}.`);
  }
};
var ComponentFactoryResolver$1 = class ComponentFactoryResolver {
  static NULL = new _NullComponentFactoryResolver();
};
var RendererFactory2 = class {
};
var Renderer2 = class {
  destroyNode = null;
  static __NG_ELEMENT_ID__ = () => injectRenderer2();
};
function injectRenderer2() {
  const lView = getLView();
  const tNode = getCurrentTNode();
  const nodeAtIndex = getComponentLViewByIndex(tNode.index, lView);
  return (isLView(nodeAtIndex) ? nodeAtIndex : lView)[RENDERER];
}
var Sanitizer = class _Sanitizer {
  static ɵprov = ɵɵdefineInjectable({
    token: _Sanitizer,
    providedIn: "root",
    factory: () => null
  });
};
function isModuleWithProviders(value) {
  return value.ngModule !== void 0;
}
function isNgModule(value) {
  return !!getNgModuleDef(value);
}
function isPipe(value) {
  return !!getPipeDef(value);
}
function isDirective(value) {
  return !!getDirectiveDef(value);
}
function isComponent(value) {
  return !!getComponentDef(value);
}
function getDependencyTypeForError(type) {
  if (getComponentDef(type)) return "component";
  if (getDirectiveDef(type)) return "directive";
  if (getPipeDef(type)) return "pipe";
  return "type";
}
function verifyStandaloneImport(depType, importingType) {
  if (isForwardRef(depType)) {
    depType = resolveForwardRef(depType);
    if (!depType) {
      throw new Error(`Expected forwardRef function, imported from "${stringifyForError(importingType)}", to return a standalone entity or NgModule but got "${stringifyForError(depType) || depType}".`);
    }
  }
  if (getNgModuleDef(depType) == null) {
    const def = getComponentDef(depType) || getDirectiveDef(depType) || getPipeDef(depType);
    if (def != null) {
      if (!def.standalone) {
        const type = getDependencyTypeForError(depType);
        throw new Error(`The "${stringifyForError(depType)}" ${type}, imported from "${stringifyForError(importingType)}", is not standalone. Does the ${type} have the standalone: false flag?`);
      }
    } else {
      if (isModuleWithProviders(depType)) {
        throw new Error(`A module with providers was imported from "${stringifyForError(importingType)}". Modules with providers are not supported in standalone components imports.`);
      } else {
        throw new Error(`The "${stringifyForError(depType)}" type, imported from "${stringifyForError(importingType)}", must be a standalone component / directive / pipe or an NgModule. Did you forget to add the required @Component / @Directive / @Pipe or @NgModule annotation?`);
      }
    }
  }
}
var DepsTracker = class {
  ownerNgModule = /* @__PURE__ */ new WeakMap();
  ngModulesWithSomeUnresolvedDecls = /* @__PURE__ */ new Set();
  ngModulesScopeCache = /* @__PURE__ */ new WeakMap();
  standaloneComponentsScopeCache = /* @__PURE__ */ new WeakMap();
  resolveNgModulesDecls() {
    if (this.ngModulesWithSomeUnresolvedDecls.size === 0) {
      return;
    }
    for (const moduleType of this.ngModulesWithSomeUnresolvedDecls) {
      const def = getNgModuleDef(moduleType);
      if (def?.declarations) {
        for (const decl of maybeUnwrapFn(def.declarations)) {
          if (isComponent(decl)) {
            this.ownerNgModule.set(decl, moduleType);
          }
        }
      }
    }
    this.ngModulesWithSomeUnresolvedDecls.clear();
  }
  getComponentDependencies(type, rawImports) {
    this.resolveNgModulesDecls();
    const def = getComponentDef(type);
    if (def === null) {
      throw new Error(`Attempting to get component dependencies for a type that is not a component: ${type}`);
    }
    if (def.standalone) {
      const scope = this.getStandaloneComponentScope(type, rawImports);
      if (scope.compilation.isPoisoned) {
        return {
          dependencies: []
        };
      }
      return {
        dependencies: [...scope.compilation.directives, ...scope.compilation.pipes, ...scope.compilation.ngModules]
      };
    } else {
      if (!this.ownerNgModule.has(type)) {
        return {
          dependencies: []
        };
      }
      const scope = this.getNgModuleScope(this.ownerNgModule.get(type));
      if (scope.compilation.isPoisoned) {
        return {
          dependencies: []
        };
      }
      return {
        dependencies: [...scope.compilation.directives, ...scope.compilation.pipes]
      };
    }
  }
  registerNgModule(type, scopeInfo) {
    if (!isNgModule(type)) {
      throw new Error(`Attempting to register a Type which is not NgModule as NgModule: ${type}`);
    }
    this.ngModulesWithSomeUnresolvedDecls.add(type);
  }
  clearScopeCacheFor(type) {
    this.ngModulesScopeCache.delete(type);
    this.standaloneComponentsScopeCache.delete(type);
  }
  getNgModuleScope(type) {
    if (this.ngModulesScopeCache.has(type)) {
      return this.ngModulesScopeCache.get(type);
    }
    const scope = this.computeNgModuleScope(type);
    this.ngModulesScopeCache.set(type, scope);
    return scope;
  }
  computeNgModuleScope(type) {
    const def = getNgModuleDefOrThrow(type);
    const scope = {
      exported: {
        directives: /* @__PURE__ */ new Set(),
        pipes: /* @__PURE__ */ new Set()
      },
      compilation: {
        directives: /* @__PURE__ */ new Set(),
        pipes: /* @__PURE__ */ new Set()
      }
    };
    for (const imported of maybeUnwrapFn(def.imports)) {
      if (isNgModule(imported)) {
        const importedScope = this.getNgModuleScope(imported);
        addSet(importedScope.exported.directives, scope.compilation.directives);
        addSet(importedScope.exported.pipes, scope.compilation.pipes);
      } else if (isStandalone(imported)) {
        if (isDirective(imported) || isComponent(imported)) {
          scope.compilation.directives.add(imported);
        } else if (isPipe(imported)) {
          scope.compilation.pipes.add(imported);
        } else {
          throw new RuntimeError(980, "The standalone imported type is neither a component nor a directive nor a pipe");
        }
      } else {
        scope.compilation.isPoisoned = true;
        break;
      }
    }
    if (!scope.compilation.isPoisoned) {
      for (const decl of maybeUnwrapFn(def.declarations)) {
        if (isNgModule(decl) || isStandalone(decl)) {
          scope.compilation.isPoisoned = true;
          break;
        }
        if (isPipe(decl)) {
          scope.compilation.pipes.add(decl);
        } else {
          scope.compilation.directives.add(decl);
        }
      }
    }
    for (const exported of maybeUnwrapFn(def.exports)) {
      if (isNgModule(exported)) {
        const exportedScope = this.getNgModuleScope(exported);
        addSet(exportedScope.exported.directives, scope.exported.directives);
        addSet(exportedScope.exported.pipes, scope.exported.pipes);
        addSet(exportedScope.exported.directives, scope.compilation.directives);
        addSet(exportedScope.exported.pipes, scope.compilation.pipes);
      } else if (isPipe(exported)) {
        scope.exported.pipes.add(exported);
      } else {
        scope.exported.directives.add(exported);
      }
    }
    return scope;
  }
  getStandaloneComponentScope(type, rawImports) {
    if (this.standaloneComponentsScopeCache.has(type)) {
      return this.standaloneComponentsScopeCache.get(type);
    }
    const ans = this.computeStandaloneComponentScope(type, rawImports);
    this.standaloneComponentsScopeCache.set(type, ans);
    return ans;
  }
  computeStandaloneComponentScope(type, rawImports) {
    const ans = {
      compilation: {
        directives: /* @__PURE__ */ new Set([type]),
        pipes: /* @__PURE__ */ new Set(),
        ngModules: /* @__PURE__ */ new Set()
      }
    };
    for (const rawImport of flatten(rawImports ?? [])) {
      const imported = resolveForwardRef(rawImport);
      try {
        verifyStandaloneImport(imported, type);
      } catch (e) {
        ans.compilation.isPoisoned = true;
        return ans;
      }
      if (isNgModule(imported)) {
        ans.compilation.ngModules.add(imported);
        const importedScope = this.getNgModuleScope(imported);
        if (importedScope.exported.isPoisoned) {
          ans.compilation.isPoisoned = true;
          return ans;
        }
        addSet(importedScope.exported.directives, ans.compilation.directives);
        addSet(importedScope.exported.pipes, ans.compilation.pipes);
      } else if (isPipe(imported)) {
        ans.compilation.pipes.add(imported);
      } else if (isDirective(imported) || isComponent(imported)) {
        ans.compilation.directives.add(imported);
      } else {
        ans.compilation.isPoisoned = true;
        return ans;
      }
    }
    return ans;
  }
  isOrphanComponent(cmp) {
    const def = getComponentDef(cmp);
    if (!def || def.standalone) {
      return false;
    }
    this.resolveNgModulesDecls();
    return !this.ownerNgModule.has(cmp);
  }
};
function addSet(sourceSet, targetSet) {
  for (const m of sourceSet) {
    targetSet.add(m);
  }
}
var depsTracker = new DepsTracker();
var NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR = {};
var ChainedInjector = class {
  injector;
  parentInjector;
  constructor(injector, parentInjector) {
    this.injector = injector;
    this.parentInjector = parentInjector;
  }
  get(token, notFoundValue, options) {
    const value = this.injector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR, options);
    if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR || notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
      return value;
    }
    return this.parentInjector.get(token, notFoundValue, options);
  }
};
function computeStaticStyling(tNode, attrs, writeToHost) {
  ngDevMode && assertFirstCreatePass(getTView(), "Expecting to be called in first template pass only");
  let styles = writeToHost ? tNode.styles : null;
  let classes = writeToHost ? tNode.classes : null;
  let mode = 0;
  if (attrs !== null) {
    for (let i = 0; i < attrs.length; i++) {
      const value = attrs[i];
      if (typeof value === "number") {
        mode = value;
      } else if (mode == 1) {
        classes = concatStringsWithSpace(classes, value);
      } else if (mode == 2) {
        const style = value;
        const styleValue = attrs[++i];
        styles = concatStringsWithSpace(styles, style + ": " + styleValue + ";");
      }
    }
  }
  writeToHost ? tNode.styles = styles : tNode.stylesWithoutHost = styles;
  writeToHost ? tNode.classes = classes : tNode.classesWithoutHost = classes;
}
function ɵɵdirectiveInject(token, flags = 0) {
  const lView = getLView();
  if (lView === null) {
    ngDevMode && assertInjectImplementationNotEqual(ɵɵdirectiveInject);
    return ɵɵinject(token, flags);
  }
  const tNode = getCurrentTNode();
  const value = getOrCreateInjectable(tNode, lView, resolveForwardRef(token), flags);
  ngDevMode && emitInjectEvent(token, value, flags);
  return value;
}
function ɵɵinvalidFactory() {
  const msg = ngDevMode ? `This constructor was not compatible with Dependency Injection.` : "invalid";
  throw new Error(msg);
}
function resolveDirectives(tView, lView, tNode, localRefs, directiveMatcher) {
  ngDevMode && assertFirstCreatePass(tView);
  const exportsMap = localRefs === null ? null : {
    "": -1
  };
  const matchedDirectiveDefs = directiveMatcher(tView, tNode);
  if (matchedDirectiveDefs !== null) {
    let directiveDefs = matchedDirectiveDefs;
    let hostDirectiveDefs = null;
    let hostDirectiveRanges = null;
    for (const def of matchedDirectiveDefs) {
      if (def.resolveHostDirectives !== null) {
        [directiveDefs, hostDirectiveDefs, hostDirectiveRanges] = def.resolveHostDirectives(matchedDirectiveDefs);
        break;
      }
    }
    ngDevMode && assertNoDuplicateDirectives(directiveDefs);
    initializeDirectives(tView, lView, tNode, directiveDefs, exportsMap, hostDirectiveDefs, hostDirectiveRanges);
  }
  if (exportsMap !== null && localRefs !== null) {
    cacheMatchingLocalNames(tNode, localRefs, exportsMap);
  }
}
function cacheMatchingLocalNames(tNode, localRefs, exportsMap) {
  const localNames = tNode.localNames = [];
  for (let i = 0; i < localRefs.length; i += 2) {
    const index = exportsMap[localRefs[i + 1]];
    if (index == null) throw new RuntimeError(-301, ngDevMode && `Export of name '${localRefs[i + 1]}' not found!`);
    localNames.push(localRefs[i], index);
  }
}
function markAsComponentHost(tView, hostTNode, componentOffset) {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && assertGreaterThan(componentOffset, -1, "componentOffset must be great than -1");
  hostTNode.componentOffset = componentOffset;
  (tView.components ??= []).push(hostTNode.index);
}
function initializeDirectives(tView, lView, tNode, directives, exportsMap, hostDirectiveDefs, hostDirectiveRanges) {
  ngDevMode && assertFirstCreatePass(tView);
  const directivesLength = directives.length;
  let componentDef = null;
  for (let i = 0; i < directivesLength; i++) {
    const def = directives[i];
    if (componentDef === null && isComponentDef(def)) {
      componentDef = def;
      markAsComponentHost(tView, tNode, i);
    }
    diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, def.type);
  }
  initTNodeFlags(tNode, tView.data.length, directivesLength);
  if (componentDef?.viewProvidersResolver) {
    componentDef.viewProvidersResolver(componentDef);
  }
  for (let i = 0; i < directivesLength; i++) {
    const def = directives[i];
    if (def.providersResolver) {
      def.providersResolver(def);
    }
  }
  let preOrderHooksFound = false;
  let preOrderCheckHooksFound = false;
  let directiveIdx = allocExpando(tView, lView, directivesLength, null);
  ngDevMode && assertSame(directiveIdx, tNode.directiveStart, "TNode.directiveStart should point to just allocated space");
  if (directivesLength > 0) {
    tNode.directiveToIndex = /* @__PURE__ */ new Map();
  }
  for (let i = 0; i < directivesLength; i++) {
    const def = directives[i];
    tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, def.hostAttrs);
    configureViewWithDirective(tView, tNode, lView, directiveIdx, def);
    saveNameToExportMap(directiveIdx, def, exportsMap);
    if (hostDirectiveRanges !== null && hostDirectiveRanges.has(def)) {
      const [start, end] = hostDirectiveRanges.get(def);
      tNode.directiveToIndex.set(def.type, [directiveIdx, start + tNode.directiveStart, end + tNode.directiveStart]);
    } else if (hostDirectiveDefs === null || !hostDirectiveDefs.has(def)) {
      tNode.directiveToIndex.set(def.type, directiveIdx);
    }
    if (def.contentQueries !== null) tNode.flags |= 4;
    if (def.hostBindings !== null || def.hostAttrs !== null || def.hostVars !== 0) tNode.flags |= 64;
    const lifeCycleHooks = def.type.prototype;
    if (!preOrderHooksFound && (lifeCycleHooks.ngOnChanges || lifeCycleHooks.ngOnInit || lifeCycleHooks.ngDoCheck)) {
      (tView.preOrderHooks ??= []).push(tNode.index);
      preOrderHooksFound = true;
    }
    if (!preOrderCheckHooksFound && (lifeCycleHooks.ngOnChanges || lifeCycleHooks.ngDoCheck)) {
      (tView.preOrderCheckHooks ??= []).push(tNode.index);
      preOrderCheckHooksFound = true;
    }
    directiveIdx++;
  }
  initializeInputAndOutputAliases(tView, tNode, hostDirectiveDefs);
}
function initializeInputAndOutputAliases(tView, tNode, hostDirectiveDefs) {
  ngDevMode && assertFirstCreatePass(tView);
  for (let index = tNode.directiveStart; index < tNode.directiveEnd; index++) {
    const directiveDef = tView.data[index];
    if (hostDirectiveDefs === null || !hostDirectiveDefs.has(directiveDef)) {
      setupSelectorMatchedInputsOrOutputs(0, tNode, directiveDef, index);
      setupSelectorMatchedInputsOrOutputs(1, tNode, directiveDef, index);
      setupInitialInputs(tNode, index, false);
    } else {
      const hostDirectiveDef = hostDirectiveDefs.get(directiveDef);
      setupHostDirectiveInputsOrOutputs(0, tNode, hostDirectiveDef, index);
      setupHostDirectiveInputsOrOutputs(1, tNode, hostDirectiveDef, index);
      setupInitialInputs(tNode, index, true);
    }
  }
}
function setupSelectorMatchedInputsOrOutputs(mode, tNode, def, directiveIndex) {
  const aliasMap = mode === 0 ? def.inputs : def.outputs;
  for (const publicName in aliasMap) {
    if (aliasMap.hasOwnProperty(publicName)) {
      let bindings;
      if (mode === 0) {
        bindings = tNode.inputs ??= {};
      } else {
        bindings = tNode.outputs ??= {};
      }
      bindings[publicName] ??= [];
      bindings[publicName].push(directiveIndex);
      setShadowStylingInputFlags(tNode, publicName);
    }
  }
}
function setupHostDirectiveInputsOrOutputs(mode, tNode, config, directiveIndex) {
  const aliasMap = mode === 0 ? config.inputs : config.outputs;
  for (const initialName in aliasMap) {
    if (aliasMap.hasOwnProperty(initialName)) {
      const publicName = aliasMap[initialName];
      let bindings;
      if (mode === 0) {
        bindings = tNode.hostDirectiveInputs ??= {};
      } else {
        bindings = tNode.hostDirectiveOutputs ??= {};
      }
      bindings[publicName] ??= [];
      bindings[publicName].push(directiveIndex, initialName);
      setShadowStylingInputFlags(tNode, publicName);
    }
  }
}
function setShadowStylingInputFlags(tNode, publicName) {
  if (publicName === "class") {
    tNode.flags |= 8;
  } else if (publicName === "style") {
    tNode.flags |= 16;
  }
}
function setupInitialInputs(tNode, directiveIndex, isHostDirective) {
  const {
    attrs,
    inputs,
    hostDirectiveInputs
  } = tNode;
  if (attrs === null || !isHostDirective && inputs === null || isHostDirective && hostDirectiveInputs === null || isInlineTemplate(tNode)) {
    tNode.initialInputs ??= [];
    tNode.initialInputs.push(null);
    return;
  }
  let inputsToStore = null;
  let i = 0;
  while (i < attrs.length) {
    const attrName = attrs[i];
    if (attrName === 0) {
      i += 4;
      continue;
    } else if (attrName === 5) {
      i += 2;
      continue;
    } else if (typeof attrName === "number") {
      break;
    }
    if (!isHostDirective && inputs.hasOwnProperty(attrName)) {
      const inputConfig = inputs[attrName];
      for (const index of inputConfig) {
        if (index === directiveIndex) {
          inputsToStore ??= [];
          inputsToStore.push(attrName, attrs[i + 1]);
          break;
        }
      }
    } else if (isHostDirective && hostDirectiveInputs.hasOwnProperty(attrName)) {
      const config = hostDirectiveInputs[attrName];
      for (let j = 0; j < config.length; j += 2) {
        if (config[j] === directiveIndex) {
          inputsToStore ??= [];
          inputsToStore.push(config[j + 1], attrs[i + 1]);
          break;
        }
      }
    }
    i += 2;
  }
  tNode.initialInputs ??= [];
  tNode.initialInputs.push(inputsToStore);
}
function configureViewWithDirective(tView, tNode, lView, directiveIndex, def) {
  ngDevMode && assertGreaterThanOrEqual(directiveIndex, HEADER_OFFSET, "Must be in Expando section");
  tView.data[directiveIndex] = def;
  const directiveFactory = def.factory || (def.factory = getFactoryDef(def.type, true));
  const nodeInjectorFactory = new NodeInjectorFactory(directiveFactory, isComponentDef(def), ɵɵdirectiveInject, ngDevMode ? def.type.name : null);
  tView.blueprint[directiveIndex] = nodeInjectorFactory;
  lView[directiveIndex] = nodeInjectorFactory;
  registerHostBindingOpCodes(tView, tNode, directiveIndex, allocExpando(tView, lView, def.hostVars, NO_CHANGE), def);
}
function registerHostBindingOpCodes(tView, tNode, directiveIdx, directiveVarsIdx, def) {
  ngDevMode && assertFirstCreatePass(tView);
  const hostBindings = def.hostBindings;
  if (hostBindings) {
    let hostBindingOpCodes = tView.hostBindingOpCodes;
    if (hostBindingOpCodes === null) {
      hostBindingOpCodes = tView.hostBindingOpCodes = [];
    }
    const elementIndx = ~tNode.index;
    if (lastSelectedElementIdx(hostBindingOpCodes) != elementIndx) {
      hostBindingOpCodes.push(elementIndx);
    }
    hostBindingOpCodes.push(directiveIdx, directiveVarsIdx, hostBindings);
  }
}
function lastSelectedElementIdx(hostBindingOpCodes) {
  let i = hostBindingOpCodes.length;
  while (i > 0) {
    const value = hostBindingOpCodes[--i];
    if (typeof value === "number" && value < 0) {
      return value;
    }
  }
  return 0;
}
function saveNameToExportMap(directiveIdx, def, exportsMap) {
  if (exportsMap) {
    if (def.exportAs) {
      for (let i = 0; i < def.exportAs.length; i++) {
        exportsMap[def.exportAs[i]] = directiveIdx;
      }
    }
    if (isComponentDef(def)) exportsMap[""] = directiveIdx;
  }
}
function initTNodeFlags(tNode, index, numberOfDirectives) {
  ngDevMode && assertNotEqual(numberOfDirectives, tNode.directiveEnd - tNode.directiveStart, "Reached the max number of directives");
  tNode.flags |= 1;
  tNode.directiveStart = index;
  tNode.directiveEnd = index + numberOfDirectives;
  tNode.providerIndexes = index;
}
function assertNoDuplicateDirectives(directives) {
  if (directives.length < 2) {
    return;
  }
  const seenDirectives = /* @__PURE__ */ new Set();
  for (const current of directives) {
    if (seenDirectives.has(current)) {
      throw new RuntimeError(309, `Directive ${current.type.name} matches multiple times on the same element. Directives can only match an element once.`);
    }
    seenDirectives.add(current);
  }
}
function directiveHostFirstCreatePass(index, lView, type, name, directiveMatcher, bindingsEnabled, attrsIndex, localRefsIndex) {
  const tView = lView[TVIEW];
  ngDevMode && assertFirstCreatePass(tView);
  const tViewConsts = tView.consts;
  const attrs = getConstant(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, type, name, attrs);
  if (bindingsEnabled) {
    resolveDirectives(tView, lView, tNode, getConstant(tViewConsts, localRefsIndex), directiveMatcher);
  }
  tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, tNode.attrs);
  if (tNode.attrs !== null) {
    computeStaticStyling(tNode, tNode.attrs, false);
  }
  if (tNode.mergedAttrs !== null) {
    computeStaticStyling(tNode, tNode.mergedAttrs, true);
  }
  if (tView.queries !== null) {
    tView.queries.elementStart(tView, tNode);
  }
  return tNode;
}
function directiveHostEndFirstCreatePass(tView, tNode) {
  ngDevMode && assertFirstCreatePass(tView);
  registerPostOrderHooks(tView, tNode);
  if (isContentQueryHost(tNode)) {
    tView.queries.elementEnd(tNode);
  }
}
function domOnlyFirstCreatePass(index, tView, type, name, attrsIndex, localRefsIndex) {
  ngDevMode && assertFirstCreatePass(tView);
  const tViewConsts = tView.consts;
  const attrs = getConstant(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, type, name, attrs);
  tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, tNode.attrs);
  if (localRefsIndex != null) {
    const refs = getConstant(tViewConsts, localRefsIndex);
    tNode.localNames = [];
    for (let i = 0; i < refs.length; i += 2) {
      tNode.localNames.push(refs[i], -1);
    }
  }
  if (tNode.attrs !== null) {
    computeStaticStyling(tNode, tNode.attrs, false);
  }
  if (tNode.mergedAttrs !== null) {
    computeStaticStyling(tNode, tNode.mergedAttrs, true);
  }
  if (tView.queries !== null) {
    tView.queries.elementStart(tView, tNode);
  }
  return tNode;
}
function isListLikeIterable(obj) {
  if (!isJsObject(obj)) return false;
  return Array.isArray(obj) || !(obj instanceof Map) && Symbol.iterator in obj;
}
function areIterablesEqual(a, b, comparator) {
  const iterator1 = a[Symbol.iterator]();
  const iterator2 = b[Symbol.iterator]();
  while (true) {
    const item1 = iterator1.next();
    const item2 = iterator2.next();
    if (item1.done && item2.done) return true;
    if (item1.done || item2.done) return false;
    if (!comparator(item1.value, item2.value)) return false;
  }
}
function iterateListLike(obj, fn) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      fn(obj[i]);
    }
  } else {
    const iterator = obj[Symbol.iterator]();
    let item;
    while (!(item = iterator.next()).done) {
      fn(item.value);
    }
  }
}
function isJsObject(o) {
  return o !== null && (typeof o === "function" || typeof o === "object");
}
function devModeEqual(a, b) {
  const isListLikeIterableA = isListLikeIterable(a);
  const isListLikeIterableB = isListLikeIterable(b);
  if (isListLikeIterableA && isListLikeIterableB) {
    return areIterablesEqual(a, b, devModeEqual);
  } else {
    const isAObject = a && (typeof a === "object" || typeof a === "function");
    const isBObject = b && (typeof b === "object" || typeof b === "function");
    if (!isListLikeIterableA && isAObject && !isListLikeIterableB && isBObject) {
      return true;
    } else {
      return Object.is(a, b);
    }
  }
}
function updateBinding(lView, bindingIndex, value) {
  return lView[bindingIndex] = value;
}
function getBinding(lView, bindingIndex) {
  ngDevMode && assertIndexInRange(lView, bindingIndex);
  ngDevMode && assertNotSame(lView[bindingIndex], NO_CHANGE, "Stored value should never be NO_CHANGE.");
  return lView[bindingIndex];
}
function bindingUpdated(lView, bindingIndex, value) {
  ngDevMode && assertLessThan(bindingIndex, lView.length, `Slot should have been initialized to NO_CHANGE`);
  if (value === NO_CHANGE) {
    return false;
  }
  const oldValue = lView[bindingIndex];
  if (Object.is(oldValue, value)) {
    return false;
  } else {
    if (ngDevMode && isInCheckNoChangesMode()) {
      const oldValueToCompare = oldValue !== NO_CHANGE ? oldValue : void 0;
      if (!devModeEqual(oldValueToCompare, value)) {
        const details = getExpressionChangedErrorDetails(lView, bindingIndex, oldValueToCompare, value);
        throwErrorIfNoChangesMode(oldValue === NO_CHANGE, details.oldValue, details.newValue, details.propName, lView);
      }
      return false;
    }
    lView[bindingIndex] = value;
    return true;
  }
}
function bindingUpdated2(lView, bindingIndex, exp1, exp2) {
  const different = bindingUpdated(lView, bindingIndex, exp1);
  return bindingUpdated(lView, bindingIndex + 1, exp2) || different;
}
function bindingUpdated3(lView, bindingIndex, exp1, exp2, exp3) {
  const different = bindingUpdated2(lView, bindingIndex, exp1, exp2);
  return bindingUpdated(lView, bindingIndex + 2, exp3) || different;
}
function bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4) {
  const different = bindingUpdated2(lView, bindingIndex, exp1, exp2);
  return bindingUpdated2(lView, bindingIndex + 2, exp3, exp4) || different;
}
var ɵCONTROL = /* @__PURE__ */ Symbol("CONTROL");
function wrapListener(tNode, lView, listenerFn) {
  return function wrapListenerIn_markDirtyAndPreventDefault(event) {
    const startView = isComponentHost(tNode) ? getComponentLViewByIndex(tNode.index, lView) : lView;
    markViewDirty(startView, 5);
    const context = lView[CONTEXT];
    let result = executeListenerWithErrorHandling(lView, context, listenerFn, event);
    let nextListenerFn = wrapListenerIn_markDirtyAndPreventDefault.__ngNextListenerFn__;
    while (nextListenerFn) {
      result = executeListenerWithErrorHandling(lView, context, nextListenerFn, event) && result;
      nextListenerFn = nextListenerFn.__ngNextListenerFn__;
    }
    return result;
  };
}
function executeListenerWithErrorHandling(lView, context, listenerFn, e) {
  const prevConsumer = setActiveConsumer(null);
  try {
    profiler(ProfilerEvent.OutputStart, context, listenerFn);
    return listenerFn(e) !== false;
  } catch (error) {
    handleUncaughtError(lView, error);
    return false;
  } finally {
    profiler(ProfilerEvent.OutputEnd, context, listenerFn);
    setActiveConsumer(prevConsumer);
  }
}
function listenToDomEvent(tNode, tView, lView, eventTargetResolver, renderer, eventName, originalListener, wrappedListener) {
  ngDevMode && assertNotSame(wrappedListener, originalListener, "Expected wrapped and original listeners to be different.");
  const isTNodeDirectiveHost = isDirectiveHost(tNode);
  let hasCoalesced = false;
  let existingListener = null;
  if (!eventTargetResolver && isTNodeDirectiveHost) {
    existingListener = findExistingListener(tView, lView, eventName, tNode.index);
  }
  if (existingListener !== null) {
    const lastListenerFn = existingListener.__ngLastListenerFn__ || existingListener;
    lastListenerFn.__ngNextListenerFn__ = originalListener;
    existingListener.__ngLastListenerFn__ = originalListener;
    hasCoalesced = true;
  } else {
    const native = getNativeByTNode(tNode, lView);
    const target = eventTargetResolver ? eventTargetResolver(native) : native;
    stashEventListenerImpl(lView, target, eventName, wrappedListener);
    const cleanupFn = renderer.listen(target, eventName, wrappedListener);
    if (!isAnimationEventType(eventName)) {
      const idxOrTargetGetter = eventTargetResolver ? (_lView) => eventTargetResolver(unwrapRNode(_lView[tNode.index])) : tNode.index;
      storeListenerCleanup(idxOrTargetGetter, tView, lView, eventName, wrappedListener, cleanupFn, false);
    }
  }
  return hasCoalesced;
}
function isAnimationEventType(eventName) {
  return eventName.startsWith("animation") || eventName.startsWith("transition");
}
function findExistingListener(tView, lView, eventName, tNodeIndex) {
  const tCleanup = tView.cleanup;
  if (tCleanup != null) {
    for (let i = 0; i < tCleanup.length - 1; i += 2) {
      const cleanupEventName = tCleanup[i];
      if (cleanupEventName === eventName && tCleanup[i + 1] === tNodeIndex) {
        const lCleanup = lView[CLEANUP];
        const listenerIdxInLCleanup = tCleanup[i + 2];
        return lCleanup && lCleanup.length > listenerIdxInLCleanup ? lCleanup[listenerIdxInLCleanup] : null;
      }
      if (typeof cleanupEventName === "string") {
        i += 2;
      }
    }
  }
  return null;
}
function storeListenerCleanup(indexOrTargetGetter, tView, lView, eventName, listenerFn, cleanup, isOutput) {
  const tCleanup = tView.firstCreatePass ? getOrCreateTViewCleanup(tView) : null;
  const lCleanup = getOrCreateLViewCleanup(lView);
  const index = lCleanup.length;
  lCleanup.push(listenerFn, cleanup);
  tCleanup && tCleanup.push(eventName, indexOrTargetGetter, index, (index + 1) * (isOutput ? -1 : 1));
}
function createOutputListener(tNode, lView, listenerFn, targetDef, eventName) {
  const wrappedListener = wrapListener(tNode, lView, listenerFn);
  const hasBound = listenToDirectiveOutput(tNode, lView, targetDef, eventName, wrappedListener);
  if (!hasBound && ngDevMode) {
    throw new RuntimeError(316, `${stringifyForError(targetDef.type)} does not have an output with a public name of "${eventName}".`);
  }
}
function listenToDirectiveOutput(tNode, lView, target, eventName, listenerFn) {
  let hostIndex = null;
  let hostDirectivesStart = null;
  let hostDirectivesEnd = null;
  let hasOutput2 = false;
  if (ngDevMode && !tNode.directiveToIndex?.has(target.type)) {
    throw new Error(`Node does not have a directive with type ${target.type.name}`);
  }
  const data = tNode.directiveToIndex.get(target.type);
  if (typeof data === "number") {
    hostIndex = data;
  } else {
    [hostIndex, hostDirectivesStart, hostDirectivesEnd] = data;
  }
  if (hostDirectivesStart !== null && hostDirectivesEnd !== null && tNode.hostDirectiveOutputs?.hasOwnProperty(eventName)) {
    const hostDirectiveOutputs = tNode.hostDirectiveOutputs[eventName];
    for (let i = 0; i < hostDirectiveOutputs.length; i += 2) {
      const index = hostDirectiveOutputs[i];
      if (index >= hostDirectivesStart && index <= hostDirectivesEnd) {
        ngDevMode && assertIndexInRange(lView, index);
        hasOutput2 = true;
        listenToOutput(tNode, lView, index, hostDirectiveOutputs[i + 1], eventName, listenerFn);
      } else if (index > hostDirectivesEnd) {
        break;
      }
    }
  }
  if (target.outputs.hasOwnProperty(eventName)) {
    ngDevMode && assertIndexInRange(lView, hostIndex);
    hasOutput2 = true;
    listenToOutput(tNode, lView, hostIndex, eventName, eventName, listenerFn);
  }
  return hasOutput2;
}
function listenToOutput(tNode, lView, directiveIndex, lookupName, eventName, listenerFn) {
  ngDevMode && assertIndexInRange(lView, directiveIndex);
  const instance = lView[directiveIndex];
  const tView = lView[TVIEW];
  const def = tView.data[directiveIndex];
  const propertyName = def.outputs[lookupName];
  const output2 = instance[propertyName];
  if (ngDevMode && !isOutputSubscribable(output2)) {
    throw new Error(`@Output ${propertyName} not initialized in '${instance.constructor.name}'.`);
  }
  const subscription = output2.subscribe(listenerFn);
  storeListenerCleanup(tNode.index, tView, lView, eventName, listenerFn, subscription, true);
}
function isOutputSubscribable(value) {
  return value != null && typeof value.subscribe === "function";
}
var BINDING = /* @__PURE__ */ Symbol("BINDING");
var INPUT_BINDING_METADATA = {
  kind: "input",
  requiredVars: 1
};
var FIELD_BINDING_METADATA = {
  kind: "field",
  requiredVars: 2
};
var OUTPUT_BINDING_METADATA = {
  kind: "output",
  requiredVars: 0
};
function inputBindingUpdate(targetDirectiveIdx, publicName, value) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = lView[TVIEW];
    const tNode = getSelectedTNode();
    const componentLView = getComponentLViewByIndex(tNode.index, lView);
    markViewDirty(componentLView, 1);
    const targetDef = tView.directiveRegistry[targetDirectiveIdx];
    if (ngDevMode && !targetDef) {
      throw new RuntimeError(315, `Input binding to property "${publicName}" does not have a target.`);
    }
    const hasSet = setDirectiveInput(tNode, tView, lView, targetDef, publicName, value);
    if (ngDevMode) {
      if (!hasSet) {
        throw new RuntimeError(315, `${stringifyForError(targetDef.type)} does not have an input with a public name of "${publicName}".`);
      }
      storePropertyBindingMetadata(tView.data, tNode, publicName, bindingIndex);
    }
  }
}
function controlBinding(binding, tNode) {
  const lView = getLView();
  const directive = lView[tNode.directiveStart + binding.targetIdx];
  return directive[ɵCONTROL];
}
function inputBinding(publicName, value) {
  if (publicName === "formField") {
    const binding2 = {
      [BINDING]: FIELD_BINDING_METADATA,
      create: () => {
        controlBinding(binding2, getCurrentTNode())?.create();
      },
      update: () => {
        inputBindingUpdate(binding2.targetIdx, publicName, value());
        controlBinding(binding2, getSelectedTNode())?.update();
      }
    };
    return binding2;
  }
  const binding = {
    [BINDING]: INPUT_BINDING_METADATA,
    update: () => inputBindingUpdate(binding.targetIdx, publicName, value())
  };
  return binding;
}
function outputBinding(eventName, listener) {
  const binding = {
    [BINDING]: OUTPUT_BINDING_METADATA,
    create: () => {
      const lView = getLView();
      const tNode = getCurrentTNode();
      const tView = lView[TVIEW];
      const targetDef = tView.directiveRegistry[binding.targetIdx];
      createOutputListener(tNode, lView, listener, targetDef, eventName);
    }
  };
  return binding;
}
function twoWayBinding(publicName, value) {
  const input2 = inputBinding(publicName, value);
  const output2 = outputBinding(publicName + "Change", (eventValue) => value.set(eventValue));
  ngDevMode && assertNotDefined(input2.create, "Unexpected `create` callback in inputBinding");
  ngDevMode && assertNotDefined(output2.update, "Unexpected `update` callback in outputBinding");
  const binding = {
    [BINDING]: {
      kind: "twoWay",
      requiredVars: input2[BINDING].requiredVars + output2[BINDING].requiredVars
    },
    set targetIdx(idx) {
      input2.targetIdx = idx;
      output2.targetIdx = idx;
    },
    create: output2.create,
    update: input2.update
  };
  return binding;
}
var ComponentFactoryResolver2 = class extends ComponentFactoryResolver$1 {
  ngModule;
  constructor(ngModule) {
    super();
    this.ngModule = ngModule;
  }
  resolveComponentFactory(component) {
    ngDevMode && assertComponentType(component);
    const componentDef = getComponentDef(component);
    return new ComponentFactory2(componentDef, this.ngModule);
  }
};
function toInputRefArray(map2) {
  return Object.keys(map2).map((name) => {
    const [propName, flags, transform] = map2[name];
    const inputData = {
      propName,
      templateName: name,
      isSignal: (flags & InputFlags.SignalBased) !== 0
    };
    if (transform) {
      inputData.transform = transform;
    }
    return inputData;
  });
}
function toOutputRefArray(map2) {
  return Object.keys(map2).map((name) => ({
    propName: map2[name],
    templateName: name
  }));
}
function verifyNotAnOrphanComponent(componentDef) {
  if (false) {
    if (depsTracker.isOrphanComponent(componentDef.type)) {
      throw new RuntimeError(981, `Orphan component found! Trying to render the component ${debugStringifyTypeForError(componentDef.type)} without first loading the NgModule that declares it. It is recommended to make this component standalone in order to avoid this error. If this is not possible now, import the component's NgModule in the appropriate NgModule, or the standalone component in which you are trying to render this component. If this is a lazy import, load the NgModule lazily as well and use its module injector.`);
    }
  }
}
function createRootViewInjector(componentDef, environmentInjector, injector) {
  let realEnvironmentInjector = environmentInjector instanceof EnvironmentInjector ? environmentInjector : environmentInjector?.injector;
  if (realEnvironmentInjector && componentDef.getStandaloneInjector !== null) {
    realEnvironmentInjector = componentDef.getStandaloneInjector(realEnvironmentInjector) || realEnvironmentInjector;
  }
  const rootViewInjector = realEnvironmentInjector ? new ChainedInjector(injector, realEnvironmentInjector) : injector;
  return rootViewInjector;
}
function createRootLViewEnvironment(rootLViewInjector) {
  const rendererFactory = rootLViewInjector.get(RendererFactory2, null);
  if (rendererFactory === null) {
    throw new RuntimeError(407, ngDevMode && "Angular was not able to inject a renderer (RendererFactory2). Likely this is due to a broken DI hierarchy. Make sure that any injector used to create this component has a correct parent.");
  }
  const sanitizer = rootLViewInjector.get(Sanitizer, null);
  const changeDetectionScheduler = rootLViewInjector.get(ChangeDetectionScheduler, null);
  let ngReflect = false;
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    ngReflect = rootLViewInjector.get(NG_REFLECT_ATTRS_FLAG, NG_REFLECT_ATTRS_FLAG_DEFAULT);
  }
  return {
    rendererFactory,
    sanitizer,
    changeDetectionScheduler,
    ngReflect
  };
}
function createHostElement(componentDef, renderer) {
  const tagName = inferTagNameFromDefinition(componentDef);
  const namespace = tagName === "svg" ? SVG_NAMESPACE : tagName === "math" ? MATH_ML_NAMESPACE : null;
  return createElementNode(renderer, tagName, namespace);
}
function inferTagNameFromDefinition(componentDef) {
  return (componentDef.selectors[0][0] || "div").toLowerCase();
}
var ComponentFactory2 = class extends ComponentFactory$1 {
  componentDef;
  ngModule;
  selector;
  componentType;
  ngContentSelectors;
  isBoundToModule;
  cachedInputs = null;
  cachedOutputs = null;
  get inputs() {
    this.cachedInputs ??= toInputRefArray(this.componentDef.inputs);
    return this.cachedInputs;
  }
  get outputs() {
    this.cachedOutputs ??= toOutputRefArray(this.componentDef.outputs);
    return this.cachedOutputs;
  }
  constructor(componentDef, ngModule) {
    super();
    this.componentDef = componentDef;
    this.ngModule = ngModule;
    this.componentType = componentDef.type;
    this.selector = stringifyCSSSelectorList(componentDef.selectors);
    this.ngContentSelectors = componentDef.ngContentSelectors ?? [];
    this.isBoundToModule = !!ngModule;
  }
  create(injector, projectableNodes, rootSelectorOrNode, environmentInjector, directives, componentBindings) {
    profiler(ProfilerEvent.DynamicComponentStart);
    const prevConsumer = setActiveConsumer(null);
    try {
      const cmpDef = this.componentDef;
      ngDevMode && verifyNotAnOrphanComponent(cmpDef);
      const rootTView = createRootTView(rootSelectorOrNode, cmpDef, componentBindings, directives);
      const rootViewInjector = createRootViewInjector(cmpDef, environmentInjector || this.ngModule, injector);
      const environment = createRootLViewEnvironment(rootViewInjector);
      const hostRenderer = environment.rendererFactory.createRenderer(null, cmpDef);
      const hostElement = rootSelectorOrNode ? locateHostElement(hostRenderer, rootSelectorOrNode, cmpDef.encapsulation, rootViewInjector) : createHostElement(cmpDef, hostRenderer);
      const hasInputBindings = componentBindings?.some(isInputBinding) || directives?.some((d) => typeof d !== "function" && d.bindings.some(isInputBinding));
      const rootLView = createLView(null, rootTView, null, 512 | getInitialLViewFlagsFromDef(cmpDef), null, null, environment, hostRenderer, rootViewInjector, null, retrieveHydrationInfo(hostElement, rootViewInjector, true));
      rootLView[HEADER_OFFSET] = hostElement;
      enterView(rootLView);
      let componentView = null;
      try {
        const hostTNode = directiveHostFirstCreatePass(HEADER_OFFSET, rootLView, 2, "#host", () => rootTView.directiveRegistry, true, 0);
        setupStaticAttributes(hostRenderer, hostElement, hostTNode);
        attachPatchData(hostElement, rootLView);
        createDirectivesInstances(rootTView, rootLView, hostTNode);
        executeContentQueries(rootTView, hostTNode, rootLView);
        directiveHostEndFirstCreatePass(rootTView, hostTNode);
        if (projectableNodes !== void 0) {
          projectNodes(hostTNode, this.ngContentSelectors, projectableNodes);
        }
        componentView = getComponentLViewByIndex(hostTNode.index, rootLView);
        rootLView[CONTEXT] = componentView[CONTEXT];
        renderView(rootTView, rootLView, null);
      } catch (e) {
        if (componentView !== null) {
          unregisterLView(componentView);
        }
        unregisterLView(rootLView);
        throw e;
      } finally {
        profiler(ProfilerEvent.DynamicComponentEnd);
        leaveView();
      }
      return new ComponentRef2(this.componentType, rootLView, !!hasInputBindings);
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
};
function createRootTView(rootSelectorOrNode, componentDef, componentBindings, directives) {
  const tAttributes = rootSelectorOrNode ? ["ng-version", "21.1.4"] : extractAttrsAndClassesFromSelector(componentDef.selectors[0]);
  let creationBindings = null;
  let updateBindings = null;
  let varsToAllocate = 0;
  if (componentBindings) {
    for (const binding of componentBindings) {
      varsToAllocate += binding[BINDING].requiredVars;
      if (binding.create) {
        binding.targetIdx = 0;
        (creationBindings ??= []).push(binding);
      }
      if (binding.update) {
        binding.targetIdx = 0;
        (updateBindings ??= []).push(binding);
      }
    }
  }
  if (directives) {
    for (let i = 0; i < directives.length; i++) {
      const directive = directives[i];
      if (typeof directive !== "function") {
        for (const binding of directive.bindings) {
          varsToAllocate += binding[BINDING].requiredVars;
          const targetDirectiveIdx = i + 1;
          if (binding.create) {
            binding.targetIdx = targetDirectiveIdx;
            (creationBindings ??= []).push(binding);
          }
          if (binding.update) {
            binding.targetIdx = targetDirectiveIdx;
            (updateBindings ??= []).push(binding);
          }
        }
      }
    }
  }
  const directivesToApply = [componentDef];
  if (directives) {
    for (const directive of directives) {
      const directiveType = typeof directive === "function" ? directive : directive.type;
      const directiveDef = ngDevMode ? getDirectiveDefOrThrow(directiveType) : getDirectiveDef(directiveType);
      if (ngDevMode && !directiveDef.standalone) {
        throw new RuntimeError(907, `The ${stringifyForError(directiveType)} directive must be standalone in order to be applied to a dynamically-created component.`);
      }
      directivesToApply.push(directiveDef);
    }
  }
  const rootTView = createTView(0, null, getRootTViewTemplate(creationBindings, updateBindings), 1, varsToAllocate, directivesToApply, null, null, null, [tAttributes], null);
  return rootTView;
}
function getRootTViewTemplate(creationBindings, updateBindings) {
  if (!creationBindings && !updateBindings) {
    return null;
  }
  return (flags) => {
    if (flags & 1 && creationBindings) {
      for (const binding of creationBindings) {
        binding.create();
      }
    }
    if (flags & 2 && updateBindings) {
      for (const binding of updateBindings) {
        binding.update();
      }
    }
  };
}
function isInputBinding(binding) {
  const kind = binding[BINDING].kind;
  return kind === "input" || kind === "twoWay";
}
var ComponentRef2 = class extends ComponentRef$1 {
  _rootLView;
  _hasInputBindings;
  instance;
  hostView;
  changeDetectorRef;
  componentType;
  location;
  previousInputValues = null;
  _tNode;
  constructor(componentType, _rootLView, _hasInputBindings) {
    super();
    this._rootLView = _rootLView;
    this._hasInputBindings = _hasInputBindings;
    this._tNode = getTNode(_rootLView[TVIEW], HEADER_OFFSET);
    this.location = createElementRef(this._tNode, _rootLView);
    this.instance = getComponentLViewByIndex(this._tNode.index, _rootLView)[CONTEXT];
    this.hostView = this.changeDetectorRef = new ViewRef(_rootLView, void 0);
    this.componentType = componentType;
  }
  setInput(name, value) {
    if (this._hasInputBindings && ngDevMode) {
      throw new RuntimeError(317, "Cannot call `setInput` on a component that is using the `inputBinding` or `twoWayBinding` functions.");
    }
    const tNode = this._tNode;
    this.previousInputValues ??= /* @__PURE__ */ new Map();
    if (this.previousInputValues.has(name) && Object.is(this.previousInputValues.get(name), value)) {
      return;
    }
    const lView = this._rootLView;
    const hasSetInput = setAllInputsForProperty(tNode, lView[TVIEW], lView, name, value);
    this.previousInputValues.set(name, value);
    const childComponentLView = getComponentLViewByIndex(tNode.index, lView);
    markViewDirty(childComponentLView, 1);
    if (ngDevMode && !hasSetInput) {
      const cmpNameForError = stringifyForError(this.componentType);
      let message = `Can't set value of the '${name}' input on the '${cmpNameForError}' component. `;
      message += `Make sure that the '${name}' property is declared as an input using the input() or model() function or the @Input() decorator.`;
      reportUnknownPropertyError(message);
    }
  }
  get injector() {
    return new NodeInjector(this._tNode, this._rootLView);
  }
  destroy() {
    this.hostView.destroy();
  }
  onDestroy(callback) {
    this.hostView.onDestroy(callback);
  }
};
function projectNodes(tNode, ngContentSelectors, projectableNodes) {
  const projection = tNode.projection = [];
  for (let i = 0; i < ngContentSelectors.length; i++) {
    const nodesforSlot = projectableNodes[i];
    projection.push(nodesforSlot != null && nodesforSlot.length ? Array.from(nodesforSlot) : null);
  }
}
var ViewContainerRef = class {
  static __NG_ELEMENT_ID__ = injectViewContainerRef;
};
function injectViewContainerRef() {
  const previousTNode = getCurrentTNode();
  return createContainerRef(previousTNode, getLView());
}
var VE_ViewContainerRef = ViewContainerRef;
var R3ViewContainerRef = class ViewContainerRef2 extends VE_ViewContainerRef {
  _lContainer;
  _hostTNode;
  _hostLView;
  constructor(_lContainer, _hostTNode, _hostLView) {
    super();
    this._lContainer = _lContainer;
    this._hostTNode = _hostTNode;
    this._hostLView = _hostLView;
  }
  get element() {
    return createElementRef(this._hostTNode, this._hostLView);
  }
  get injector() {
    return new NodeInjector(this._hostTNode, this._hostLView);
  }
  get parentInjector() {
    const parentLocation = getParentInjectorLocation(this._hostTNode, this._hostLView);
    if (hasParentInjector(parentLocation)) {
      const parentView = getParentInjectorView(parentLocation, this._hostLView);
      const injectorIndex = getParentInjectorIndex(parentLocation);
      ngDevMode && assertNodeInjector(parentView, injectorIndex);
      const parentTNode = parentView[TVIEW].data[injectorIndex + 8];
      return new NodeInjector(parentTNode, parentView);
    } else {
      return new NodeInjector(null, this._hostLView);
    }
  }
  clear() {
    while (this.length > 0) {
      this.remove(this.length - 1);
    }
  }
  get(index) {
    const viewRefs = getViewRefs(this._lContainer);
    return viewRefs !== null && viewRefs[index] || null;
  }
  get length() {
    return this._lContainer.length - CONTAINER_HEADER_OFFSET;
  }
  createEmbeddedView(templateRef, context, indexOrOptions) {
    let index;
    let injector;
    if (typeof indexOrOptions === "number") {
      index = indexOrOptions;
    } else if (indexOrOptions != null) {
      index = indexOrOptions.index;
      injector = indexOrOptions.injector;
    }
    const dehydratedView = findMatchingDehydratedView(this._lContainer, templateRef.ssrId);
    const viewRef = templateRef.createEmbeddedViewImpl(context || {}, injector, dehydratedView);
    this.insertImpl(viewRef, index, shouldAddViewToDom(this._hostTNode, dehydratedView));
    return viewRef;
  }
  createComponent(componentFactoryOrType, indexOrOptions, injector, projectableNodes, environmentInjector, directives, bindings) {
    const isComponentFactory = componentFactoryOrType && !isType(componentFactoryOrType);
    let index;
    if (isComponentFactory) {
      if (ngDevMode) {
        assertEqual(typeof indexOrOptions !== "object", true, "It looks like Component factory was provided as the first argument and an options object as the second argument. This combination of arguments is incompatible. You can either change the first argument to provide Component type or change the second argument to be a number (representing an index at which to insert the new component's host view into this container)");
      }
      index = indexOrOptions;
    } else {
      if (ngDevMode) {
        assertDefined(getComponentDef(componentFactoryOrType), `Provided Component class doesn't contain Component definition. Please check whether provided class has @Component decorator.`);
        assertEqual(typeof indexOrOptions !== "number", true, "It looks like Component type was provided as the first argument and a number (representing an index at which to insert the new component's host view into this container as the second argument. This combination of arguments is incompatible. Please use an object as the second argument instead.");
      }
      const options = indexOrOptions || {};
      if (ngDevMode && options.environmentInjector && options.ngModuleRef) {
        throwError(`Cannot pass both environmentInjector and ngModuleRef options to createComponent().`);
      }
      index = options.index;
      injector = options.injector;
      projectableNodes = options.projectableNodes;
      environmentInjector = options.environmentInjector || options.ngModuleRef;
      directives = options.directives;
      bindings = options.bindings;
    }
    const componentFactory = isComponentFactory ? componentFactoryOrType : new ComponentFactory2(getComponentDef(componentFactoryOrType));
    const contextInjector = injector || this.parentInjector;
    if (!environmentInjector && componentFactory.ngModule == null) {
      const _injector = isComponentFactory ? contextInjector : this.parentInjector;
      const result = _injector.get(EnvironmentInjector, null);
      if (result) {
        environmentInjector = result;
      }
    }
    const componentDef = getComponentDef(componentFactory.componentType ?? {});
    const dehydratedView = findMatchingDehydratedView(this._lContainer, componentDef?.id ?? null);
    const rNode = dehydratedView?.firstChild ?? null;
    const componentRef = componentFactory.create(contextInjector, projectableNodes, rNode, environmentInjector, directives, bindings);
    this.insertImpl(componentRef.hostView, index, shouldAddViewToDom(this._hostTNode, dehydratedView));
    return componentRef;
  }
  insert(viewRef, index) {
    return this.insertImpl(viewRef, index, true);
  }
  insertImpl(viewRef, index, addToDOM) {
    const lView = viewRef._lView;
    if (ngDevMode && viewRef.destroyed) {
      throw new RuntimeError(922, ngDevMode && "Cannot insert a destroyed View in a ViewContainer!");
    }
    if (viewAttachedToContainer(lView)) {
      const prevIdx = this.indexOf(viewRef);
      if (prevIdx !== -1) {
        this.detach(prevIdx);
      } else {
        const prevLContainer = lView[PARENT];
        ngDevMode && assertEqual(isLContainer(prevLContainer), true, "An attached view should have its PARENT point to a container.");
        const prevVCRef = new R3ViewContainerRef(prevLContainer, prevLContainer[T_HOST], prevLContainer[PARENT]);
        prevVCRef.detach(prevVCRef.indexOf(viewRef));
      }
    }
    const adjustedIdx = this._adjustIndex(index);
    const lContainer = this._lContainer;
    addLViewToLContainer(lContainer, lView, adjustedIdx, addToDOM);
    viewRef.attachToViewContainerRef();
    addToArray(getOrCreateViewRefs(lContainer), adjustedIdx, viewRef);
    return viewRef;
  }
  move(viewRef, newIndex) {
    if (ngDevMode && viewRef.destroyed) {
      throw new RuntimeError(923, ngDevMode && "Cannot move a destroyed View in a ViewContainer!");
    }
    return this.insert(viewRef, newIndex);
  }
  indexOf(viewRef) {
    const viewRefsArr = getViewRefs(this._lContainer);
    return viewRefsArr !== null ? viewRefsArr.indexOf(viewRef) : -1;
  }
  remove(index) {
    const adjustedIdx = this._adjustIndex(index, -1);
    const detachedView = detachView(this._lContainer, adjustedIdx);
    if (detachedView) {
      removeFromArray(getOrCreateViewRefs(this._lContainer), adjustedIdx);
      destroyLView(detachedView[TVIEW], detachedView);
    }
  }
  detach(index) {
    const adjustedIdx = this._adjustIndex(index, -1);
    const view = detachView(this._lContainer, adjustedIdx);
    const wasDetached = view && removeFromArray(getOrCreateViewRefs(this._lContainer), adjustedIdx) != null;
    return wasDetached ? new ViewRef(view) : null;
  }
  _adjustIndex(index, shift = 0) {
    if (index == null) {
      return this.length + shift;
    }
    if (ngDevMode) {
      assertGreaterThan(index, -1, `ViewRef index must be positive, got ${index}`);
      assertLessThan(index, this.length + 1 + shift, "index");
    }
    return index;
  }
};
function getViewRefs(lContainer) {
  return lContainer[VIEW_REFS];
}
function getOrCreateViewRefs(lContainer) {
  return lContainer[VIEW_REFS] || (lContainer[VIEW_REFS] = []);
}
function createContainerRef(hostTNode, hostLView) {
  ngDevMode && assertTNodeType(hostTNode, 12 | 3);
  let lContainer;
  const slotValue = hostLView[hostTNode.index];
  if (isLContainer(slotValue)) {
    lContainer = slotValue;
  } else {
    lContainer = createLContainer(slotValue, hostLView, null, hostTNode);
    hostLView[hostTNode.index] = lContainer;
    addToEndOfViewTree(hostLView, lContainer);
  }
  _locateOrCreateAnchorNode(lContainer, hostLView, hostTNode, slotValue);
  return new R3ViewContainerRef(lContainer, hostTNode, hostLView);
}
function insertAnchorNode(hostLView, hostTNode) {
  const renderer = hostLView[RENDERER];
  const commentNode = renderer.createComment(ngDevMode ? "container" : "");
  const hostNative = getNativeByTNode(hostTNode, hostLView);
  const parentOfHostNative = renderer.parentNode(hostNative);
  nativeInsertBefore(renderer, parentOfHostNative, commentNode, renderer.nextSibling(hostNative), false);
  return commentNode;
}
var _locateOrCreateAnchorNode = createAnchorNode;
var _populateDehydratedViewsInLContainer = () => false;
function populateDehydratedViewsInLContainer(lContainer, tNode, hostLView) {
  return _populateDehydratedViewsInLContainer(lContainer, tNode, hostLView);
}
function createAnchorNode(lContainer, hostLView, hostTNode, slotValue) {
  if (lContainer[NATIVE]) return;
  let commentNode;
  if (hostTNode.type & 8) {
    commentNode = unwrapRNode(slotValue);
  } else {
    commentNode = insertAnchorNode(hostLView, hostTNode);
  }
  lContainer[NATIVE] = commentNode;
}
function populateDehydratedViewsInLContainerImpl(lContainer, tNode, hostLView) {
  if (lContainer[NATIVE] && lContainer[DEHYDRATED_VIEWS]) {
    return true;
  }
  const hydrationInfo = hostLView[HYDRATION];
  const noOffsetIndex = tNode.index - HEADER_OFFSET;
  const isNodeCreationMode = !hydrationInfo || isInSkipHydrationBlock2(tNode) || isDisconnectedNode$1(hydrationInfo, noOffsetIndex);
  if (isNodeCreationMode) {
    return false;
  }
  const currentRNode = getSegmentHead(hydrationInfo, noOffsetIndex);
  const serializedViews = hydrationInfo.data[CONTAINERS]?.[noOffsetIndex];
  ngDevMode && assertDefined(serializedViews, "Unexpected state: no hydration info available for a given TNode, which represents a view container.");
  const [commentNode, dehydratedViews] = locateDehydratedViewsInContainer(currentRNode, serializedViews);
  if (ngDevMode) {
    validateMatchingNode(commentNode, Node.COMMENT_NODE, null, hostLView, tNode, true);
    markRNodeAsClaimedByHydration(commentNode, false);
  }
  lContainer[NATIVE] = commentNode;
  lContainer[DEHYDRATED_VIEWS] = dehydratedViews;
  return true;
}
function locateOrCreateAnchorNode(lContainer, hostLView, hostTNode, slotValue) {
  if (!_populateDehydratedViewsInLContainer(lContainer, hostTNode, hostLView)) {
    createAnchorNode(lContainer, hostLView, hostTNode, slotValue);
  }
}
function enableLocateOrCreateContainerRefImpl() {
  _locateOrCreateAnchorNode = locateOrCreateAnchorNode;
  _populateDehydratedViewsInLContainer = populateDehydratedViewsInLContainerImpl;
}
var LQuery_ = class _LQuery_ {
  queryList;
  matches = null;
  constructor(queryList) {
    this.queryList = queryList;
  }
  clone() {
    return new _LQuery_(this.queryList);
  }
  setDirty() {
    this.queryList.setDirty();
  }
};
var LQueries_ = class _LQueries_ {
  queries;
  constructor(queries = []) {
    this.queries = queries;
  }
  createEmbeddedView(tView) {
    const tQueries = tView.queries;
    if (tQueries !== null) {
      const noOfInheritedQueries = tView.contentQueries !== null ? tView.contentQueries[0] : tQueries.length;
      const viewLQueries = [];
      for (let i = 0; i < noOfInheritedQueries; i++) {
        const tQuery = tQueries.getByIndex(i);
        const parentLQuery = this.queries[tQuery.indexInDeclarationView];
        viewLQueries.push(parentLQuery.clone());
      }
      return new _LQueries_(viewLQueries);
    }
    return null;
  }
  insertView(tView) {
    this.dirtyQueriesWithMatches(tView);
  }
  detachView(tView) {
    this.dirtyQueriesWithMatches(tView);
  }
  finishViewCreation(tView) {
    this.dirtyQueriesWithMatches(tView);
  }
  dirtyQueriesWithMatches(tView) {
    for (let i = 0; i < this.queries.length; i++) {
      if (getTQuery(tView, i).matches !== null) {
        this.queries[i].setDirty();
      }
    }
  }
};
var TQueryMetadata_ = class {
  flags;
  read;
  predicate;
  constructor(predicate, flags, read = null) {
    this.flags = flags;
    this.read = read;
    if (typeof predicate === "string") {
      this.predicate = splitQueryMultiSelectors(predicate);
    } else {
      this.predicate = predicate;
    }
  }
};
var TQueries_ = class _TQueries_ {
  queries;
  constructor(queries = []) {
    this.queries = queries;
  }
  elementStart(tView, tNode) {
    ngDevMode && assertFirstCreatePass(tView, "Queries should collect results on the first template pass only");
    for (let i = 0; i < this.queries.length; i++) {
      this.queries[i].elementStart(tView, tNode);
    }
  }
  elementEnd(tNode) {
    for (let i = 0; i < this.queries.length; i++) {
      this.queries[i].elementEnd(tNode);
    }
  }
  embeddedTView(tNode) {
    let queriesForTemplateRef = null;
    for (let i = 0; i < this.length; i++) {
      const childQueryIndex = queriesForTemplateRef !== null ? queriesForTemplateRef.length : 0;
      const tqueryClone = this.getByIndex(i).embeddedTView(tNode, childQueryIndex);
      if (tqueryClone) {
        tqueryClone.indexInDeclarationView = i;
        if (queriesForTemplateRef !== null) {
          queriesForTemplateRef.push(tqueryClone);
        } else {
          queriesForTemplateRef = [tqueryClone];
        }
      }
    }
    return queriesForTemplateRef !== null ? new _TQueries_(queriesForTemplateRef) : null;
  }
  template(tView, tNode) {
    ngDevMode && assertFirstCreatePass(tView, "Queries should collect results on the first template pass only");
    for (let i = 0; i < this.queries.length; i++) {
      this.queries[i].template(tView, tNode);
    }
  }
  getByIndex(index) {
    ngDevMode && assertIndexInRange(this.queries, index);
    return this.queries[index];
  }
  get length() {
    return this.queries.length;
  }
  track(tquery) {
    this.queries.push(tquery);
  }
};
var TQuery_ = class _TQuery_ {
  metadata;
  matches = null;
  indexInDeclarationView = -1;
  crossesNgTemplate = false;
  _declarationNodeIndex;
  _appliesToNextNode = true;
  constructor(metadata, nodeIndex = -1) {
    this.metadata = metadata;
    this._declarationNodeIndex = nodeIndex;
  }
  elementStart(tView, tNode) {
    if (this.isApplyingToNode(tNode)) {
      this.matchTNode(tView, tNode);
    }
  }
  elementEnd(tNode) {
    if (this._declarationNodeIndex === tNode.index) {
      this._appliesToNextNode = false;
    }
  }
  template(tView, tNode) {
    this.elementStart(tView, tNode);
  }
  embeddedTView(tNode, childQueryIndex) {
    if (this.isApplyingToNode(tNode)) {
      this.crossesNgTemplate = true;
      this.addMatch(-tNode.index, childQueryIndex);
      return new _TQuery_(this.metadata);
    }
    return null;
  }
  isApplyingToNode(tNode) {
    if (this._appliesToNextNode && (this.metadata.flags & 1) !== 1) {
      const declarationNodeIdx = this._declarationNodeIndex;
      let parent = tNode.parent;
      while (parent !== null && parent.type & 8 && parent.index !== declarationNodeIdx) {
        parent = parent.parent;
      }
      return declarationNodeIdx === (parent !== null ? parent.index : -1);
    }
    return this._appliesToNextNode;
  }
  matchTNode(tView, tNode) {
    const predicate = this.metadata.predicate;
    if (Array.isArray(predicate)) {
      for (let i = 0; i < predicate.length; i++) {
        const name = predicate[i];
        this.matchTNodeWithReadOption(tView, tNode, getIdxOfMatchingSelector(tNode, name));
        this.matchTNodeWithReadOption(tView, tNode, locateDirectiveOrProvider(tNode, tView, name, false, false));
      }
    } else {
      if (predicate === TemplateRef) {
        if (tNode.type & 4) {
          this.matchTNodeWithReadOption(tView, tNode, -1);
        }
      } else {
        this.matchTNodeWithReadOption(tView, tNode, locateDirectiveOrProvider(tNode, tView, predicate, false, false));
      }
    }
  }
  matchTNodeWithReadOption(tView, tNode, nodeMatchIdx) {
    if (nodeMatchIdx !== null) {
      const read = this.metadata.read;
      if (read !== null) {
        if (read === ElementRef || read === ViewContainerRef || read === TemplateRef && tNode.type & 4) {
          this.addMatch(tNode.index, -2);
        } else {
          const directiveOrProviderIdx = locateDirectiveOrProvider(tNode, tView, read, false, false);
          if (directiveOrProviderIdx !== null) {
            this.addMatch(tNode.index, directiveOrProviderIdx);
          }
        }
      } else {
        this.addMatch(tNode.index, nodeMatchIdx);
      }
    }
  }
  addMatch(tNodeIdx, matchIdx) {
    if (this.matches === null) {
      this.matches = [tNodeIdx, matchIdx];
    } else {
      this.matches.push(tNodeIdx, matchIdx);
    }
  }
};
function getIdxOfMatchingSelector(tNode, selector) {
  const localNames = tNode.localNames;
  if (localNames !== null) {
    for (let i = 0; i < localNames.length; i += 2) {
      if (localNames[i] === selector) {
        return localNames[i + 1];
      }
    }
  }
  return null;
}
function createResultByTNodeType(tNode, currentView) {
  if (tNode.type & (3 | 8)) {
    return createElementRef(tNode, currentView);
  } else if (tNode.type & 4) {
    return createTemplateRef(tNode, currentView);
  }
  return null;
}
function createResultForNode(lView, tNode, matchingIdx, read) {
  if (matchingIdx === -1) {
    return createResultByTNodeType(tNode, lView);
  } else if (matchingIdx === -2) {
    return createSpecialToken(lView, tNode, read);
  } else {
    return getNodeInjectable(lView, lView[TVIEW], matchingIdx, tNode);
  }
}
function createSpecialToken(lView, tNode, read) {
  if (read === ElementRef) {
    return createElementRef(tNode, lView);
  } else if (read === TemplateRef) {
    return createTemplateRef(tNode, lView);
  } else if (read === ViewContainerRef) {
    ngDevMode && assertTNodeType(tNode, 3 | 12);
    return createContainerRef(tNode, lView);
  } else {
    ngDevMode && throwError(`Special token to read should be one of ElementRef, TemplateRef or ViewContainerRef but got ${stringify(read)}.`);
  }
}
function materializeViewResults(tView, lView, tQuery, queryIndex) {
  const lQuery = lView[QUERIES].queries[queryIndex];
  if (lQuery.matches === null) {
    const tViewData = tView.data;
    const tQueryMatches = tQuery.matches;
    const result = [];
    for (let i = 0; tQueryMatches !== null && i < tQueryMatches.length; i += 2) {
      const matchedNodeIdx = tQueryMatches[i];
      if (matchedNodeIdx < 0) {
        result.push(null);
      } else {
        ngDevMode && assertIndexInRange(tViewData, matchedNodeIdx);
        const tNode = tViewData[matchedNodeIdx];
        result.push(createResultForNode(lView, tNode, tQueryMatches[i + 1], tQuery.metadata.read));
      }
    }
    lQuery.matches = result;
  }
  return lQuery.matches;
}
function collectQueryResults(tView, lView, queryIndex, result) {
  const tQuery = tView.queries.getByIndex(queryIndex);
  const tQueryMatches = tQuery.matches;
  if (tQueryMatches !== null) {
    const lViewResults = materializeViewResults(tView, lView, tQuery, queryIndex);
    for (let i = 0; i < tQueryMatches.length; i += 2) {
      const tNodeIdx = tQueryMatches[i];
      if (tNodeIdx > 0) {
        result.push(lViewResults[i / 2]);
      } else {
        const childQueryIndex = tQueryMatches[i + 1];
        const declarationLContainer = lView[-tNodeIdx];
        ngDevMode && assertLContainer(declarationLContainer);
        for (let i2 = CONTAINER_HEADER_OFFSET; i2 < declarationLContainer.length; i2++) {
          const embeddedLView = declarationLContainer[i2];
          if (embeddedLView[DECLARATION_LCONTAINER] === embeddedLView[PARENT]) {
            collectQueryResults(embeddedLView[TVIEW], embeddedLView, childQueryIndex, result);
          }
        }
        if (declarationLContainer[MOVED_VIEWS] !== null) {
          const embeddedLViews = declarationLContainer[MOVED_VIEWS];
          for (let i2 = 0; i2 < embeddedLViews.length; i2++) {
            const embeddedLView = embeddedLViews[i2];
            collectQueryResults(embeddedLView[TVIEW], embeddedLView, childQueryIndex, result);
          }
        }
      }
    }
  }
  return result;
}
function loadQueryInternal(lView, queryIndex) {
  ngDevMode && assertDefined(lView[QUERIES], "LQueries should be defined when trying to load a query");
  ngDevMode && assertIndexInRange(lView[QUERIES].queries, queryIndex);
  return lView[QUERIES].queries[queryIndex].queryList;
}
function createLQuery(tView, lView, flags) {
  const queryList = new QueryList((flags & 4) === 4);
  storeCleanupWithContext(tView, lView, queryList, queryList.destroy);
  const lQueries = (lView[QUERIES] ??= new LQueries_()).queries;
  return lQueries.push(new LQuery_(queryList)) - 1;
}
function createViewQuery(predicate, flags, read) {
  ngDevMode && assertNumber(flags, "Expecting flags");
  const tView = getTView();
  if (tView.firstCreatePass) {
    createTQuery(tView, new TQueryMetadata_(predicate, flags, read), -1);
    if ((flags & 2) === 2) {
      tView.staticViewQueries = true;
    }
  }
  return createLQuery(tView, getLView(), flags);
}
function createContentQuery(directiveIndex, predicate, flags, read) {
  ngDevMode && assertNumber(flags, "Expecting flags");
  const tView = getTView();
  if (tView.firstCreatePass) {
    const tNode = getCurrentTNode();
    createTQuery(tView, new TQueryMetadata_(predicate, flags, read), tNode.index);
    saveContentQueryAndDirectiveIndex(tView, directiveIndex);
    if ((flags & 2) === 2) {
      tView.staticContentQueries = true;
    }
  }
  return createLQuery(tView, getLView(), flags);
}
function splitQueryMultiSelectors(locator) {
  return locator.split(",").map((s) => s.trim());
}
function createTQuery(tView, metadata, nodeIndex) {
  if (tView.queries === null) tView.queries = new TQueries_();
  tView.queries.track(new TQuery_(metadata, nodeIndex));
}
function saveContentQueryAndDirectiveIndex(tView, directiveIndex) {
  const tViewContentQueries = tView.contentQueries || (tView.contentQueries = []);
  const lastSavedDirectiveIndex = tViewContentQueries.length ? tViewContentQueries[tViewContentQueries.length - 1] : -1;
  if (directiveIndex !== lastSavedDirectiveIndex) {
    tViewContentQueries.push(tView.queries.length - 1, directiveIndex);
  }
}
function getTQuery(tView, index) {
  ngDevMode && assertDefined(tView.queries, "TQueries must be defined to retrieve a TQuery");
  return tView.queries.getByIndex(index);
}
function getQueryResults(lView, queryIndex) {
  const tView = lView[TVIEW];
  const tQuery = getTQuery(tView, queryIndex);
  return tQuery.crossesNgTemplate ? collectQueryResults(tView, lView, queryIndex, []) : materializeViewResults(tView, lView, tQuery, queryIndex);
}
function createQuerySignalFn(firstOnly, required, opts) {
  let node;
  const signalFn = createComputed(() => {
    node._dirtyCounter();
    const value = refreshSignalQuery(node, firstOnly);
    if (required && value === void 0) {
      throw new RuntimeError(-951, ngDevMode && "Child query result is required but no value is available.");
    }
    return value;
  });
  node = signalFn[SIGNAL];
  node._dirtyCounter = signal(0);
  node._flatValue = void 0;
  if (ngDevMode) {
    signalFn.toString = () => `[Query Signal]`;
    node.debugName = opts?.debugName;
  }
  return signalFn;
}
function createSingleResultOptionalQuerySignalFn(opts) {
  return createQuerySignalFn(true, false, opts);
}
function createSingleResultRequiredQuerySignalFn(opts) {
  return createQuerySignalFn(true, true, opts);
}
function createMultiResultQuerySignalFn(opts) {
  return createQuerySignalFn(false, false, opts);
}
function bindQueryToSignal(target, queryIndex) {
  const node = target[SIGNAL];
  node._lView = getLView();
  node._queryIndex = queryIndex;
  node._queryList = loadQueryInternal(node._lView, queryIndex);
  node._queryList.onDirty(() => node._dirtyCounter.update((v) => v + 1));
}
function refreshSignalQuery(node, firstOnly) {
  const lView = node._lView;
  const queryIndex = node._queryIndex;
  if (lView === void 0 || queryIndex === void 0 || lView[FLAGS] & 4) {
    return firstOnly ? void 0 : EMPTY_ARRAY;
  }
  const queryList = loadQueryInternal(lView, queryIndex);
  const results = getQueryResults(lView, queryIndex);
  queryList.reset(results, unwrapElementRef);
  if (firstOnly) {
    return queryList.first;
  } else {
    const resultChanged = queryList._changesDetected;
    if (resultChanged || node._flatValue === void 0) {
      return node._flatValue = queryList.toArray();
    }
    return node._flatValue;
  }
}
var componentResourceResolutionQueue = /* @__PURE__ */ new Map();
var componentDefPendingResolution = /* @__PURE__ */ new Set();
async function resolveComponentResources(resourceResolver) {
  const currentQueue = componentResourceResolutionQueue;
  componentResourceResolutionQueue = /* @__PURE__ */ new Map();
  const urlCache = /* @__PURE__ */ new Map();
  function cachedResourceResolve(url) {
    const promiseCached = urlCache.get(url);
    if (promiseCached) {
      return promiseCached;
    }
    const promise = resourceResolver(url).then((response) => unwrapResponse(url, response));
    urlCache.set(url, promise);
    return promise;
  }
  const resolutionPromises = Array.from(currentQueue).map(async ([type, component]) => {
    if (component.styleUrl && component.styleUrls?.length) {
      throw new Error("@Component cannot define both `styleUrl` and `styleUrls`. Use `styleUrl` if the component has one stylesheet, or `styleUrls` if it has multiple");
    }
    const componentTasks = [];
    if (component.templateUrl) {
      componentTasks.push(cachedResourceResolve(component.templateUrl).then((template) => {
        component.template = template;
      }));
    }
    const styles = typeof component.styles === "string" ? [component.styles] : component.styles ?? [];
    component.styles = styles;
    let {
      styleUrl,
      styleUrls
    } = component;
    if (styleUrl) {
      styleUrls = [styleUrl];
      component.styleUrl = void 0;
    }
    if (styleUrls?.length) {
      const allFetched = Promise.all(styleUrls.map((url) => cachedResourceResolve(url))).then((fetchedStyles) => {
        styles.push(...fetchedStyles);
        component.styleUrls = void 0;
      });
      componentTasks.push(allFetched);
    }
    await Promise.all(componentTasks);
    componentDefPendingResolution.delete(type);
  });
  await Promise.all(resolutionPromises);
}
function maybeQueueResolutionOfComponentResources(type, metadata) {
  if (componentNeedsResolution(metadata)) {
    componentResourceResolutionQueue.set(type, metadata);
    componentDefPendingResolution.add(type);
  }
}
function isComponentDefPendingResolution(type) {
  return componentDefPendingResolution.has(type);
}
function componentNeedsResolution(component) {
  return !!(component.templateUrl && !component.hasOwnProperty("template") || component.styleUrls?.length || component.styleUrl);
}
function clearResolutionOfComponentResourcesQueue() {
  const old = componentResourceResolutionQueue;
  componentResourceResolutionQueue = /* @__PURE__ */ new Map();
  return old;
}
function restoreComponentResolutionQueue(queue) {
  componentDefPendingResolution.clear();
  for (const type of queue.keys()) {
    componentDefPendingResolution.add(type);
  }
  componentResourceResolutionQueue = queue;
}
function isComponentResourceResolutionQueueEmpty() {
  return componentResourceResolutionQueue.size === 0;
}
async function unwrapResponse(url, response) {
  if (typeof response === "string") {
    return response;
  }
  if (response.status !== void 0 && response.status !== 200) {
    throw new RuntimeError(918, ngDevMode && `Could not load resource: ${url}. Response status: ${response.status}`);
  }
  return response.text();
}
var modules = /* @__PURE__ */ new Map();
var checkForDuplicateNgModules = true;
function assertSameOrNotExisting(id, type, incoming) {
  if (type && type !== incoming && checkForDuplicateNgModules) {
    throw new RuntimeError(921, ngDevMode && `Duplicate module registered for ${id} - ${stringify(type)} vs ${stringify(type.name)}`);
  }
}
function registerNgModuleType(ngModuleType, id) {
  const existing = modules.get(id) || null;
  assertSameOrNotExisting(id, existing, ngModuleType);
  modules.set(id, ngModuleType);
}
function getRegisteredNgModuleType(id) {
  return modules.get(id);
}
function setAllowDuplicateNgModuleIdsForTest(allowDuplicates) {
  checkForDuplicateNgModules = !allowDuplicates;
}
var NgModuleRef$1 = class NgModuleRef {
};
var NgModuleFactory$1 = class NgModuleFactory {
};
function createNgModule(ngModule, parentInjector) {
  return new NgModuleRef2(ngModule, parentInjector ?? null, []);
}
var createNgModuleRef = createNgModule;
var NgModuleRef2 = class extends NgModuleRef$1 {
  ngModuleType;
  _parent;
  _bootstrapComponents = [];
  _r3Injector;
  instance;
  destroyCbs = [];
  componentFactoryResolver = new ComponentFactoryResolver2(this);
  constructor(ngModuleType, _parent, additionalProviders, runInjectorInitializers = true) {
    super();
    this.ngModuleType = ngModuleType;
    this._parent = _parent;
    const ngModuleDef = getNgModuleDef(ngModuleType);
    ngDevMode && assertDefined(ngModuleDef, `NgModule '${stringify(ngModuleType)}' is not a subtype of 'NgModuleType'.`);
    this._bootstrapComponents = maybeUnwrapFn(ngModuleDef.bootstrap);
    this._r3Injector = createInjectorWithoutInjectorInstances(ngModuleType, _parent, [{
      provide: NgModuleRef$1,
      useValue: this
    }, {
      provide: ComponentFactoryResolver$1,
      useValue: this.componentFactoryResolver
    }, ...additionalProviders], stringify(ngModuleType), /* @__PURE__ */ new Set(["environment"]));
    if (runInjectorInitializers) {
      this.resolveInjectorInitializers();
    }
  }
  resolveInjectorInitializers() {
    this._r3Injector.resolveInjectorInitializers();
    this.instance = this._r3Injector.get(this.ngModuleType);
  }
  get injector() {
    return this._r3Injector;
  }
  destroy() {
    ngDevMode && assertDefined(this.destroyCbs, "NgModule already destroyed");
    const injector = this._r3Injector;
    !injector.destroyed && injector.destroy();
    this.destroyCbs.forEach((fn) => fn());
    this.destroyCbs = null;
  }
  onDestroy(callback) {
    ngDevMode && assertDefined(this.destroyCbs, "NgModule already destroyed");
    this.destroyCbs.push(callback);
  }
};
var NgModuleFactory2 = class extends NgModuleFactory$1 {
  moduleType;
  constructor(moduleType) {
    super();
    this.moduleType = moduleType;
  }
  create(parentInjector) {
    return new NgModuleRef2(this.moduleType, parentInjector, []);
  }
};
function createNgModuleRefWithProviders(moduleType, parentInjector, additionalProviders) {
  return new NgModuleRef2(moduleType, parentInjector, additionalProviders, false);
}
var EnvironmentNgModuleRefAdapter = class extends NgModuleRef$1 {
  injector;
  componentFactoryResolver = new ComponentFactoryResolver2(this);
  instance = null;
  constructor(config) {
    super();
    const injector = new R3Injector([...config.providers, {
      provide: NgModuleRef$1,
      useValue: this
    }, {
      provide: ComponentFactoryResolver$1,
      useValue: this.componentFactoryResolver
    }], config.parent || getNullInjector(), config.debugName, /* @__PURE__ */ new Set(["environment"]));
    this.injector = injector;
    if (config.runEnvironmentInitializers) {
      injector.resolveInjectorInitializers();
    }
  }
  destroy() {
    this.injector.destroy();
  }
  onDestroy(callback) {
    this.injector.onDestroy(callback);
  }
};
function createEnvironmentInjector(providers, parent, debugName = null) {
  const adapter = new EnvironmentNgModuleRefAdapter({
    providers,
    parent,
    debugName,
    runEnvironmentInitializers: true
  });
  return adapter.injector;
}
var StandaloneService = class _StandaloneService {
  _injector;
  cachedInjectors = /* @__PURE__ */ new Map();
  constructor(_injector) {
    this._injector = _injector;
  }
  getOrCreateStandaloneInjector(componentDef) {
    if (!componentDef.standalone) {
      return null;
    }
    if (!this.cachedInjectors.has(componentDef)) {
      const providers = internalImportProvidersFrom(false, componentDef.type);
      const standaloneInjector = providers.length > 0 ? createEnvironmentInjector([providers], this._injector, typeof ngDevMode !== "undefined" && ngDevMode ? `Standalone[${componentDef.type.name}]` : "") : null;
      this.cachedInjectors.set(componentDef, standaloneInjector);
    }
    return this.cachedInjectors.get(componentDef);
  }
  ngOnDestroy() {
    try {
      for (const injector of this.cachedInjectors.values()) {
        if (injector !== null) {
          injector.destroy();
        }
      }
    } finally {
      this.cachedInjectors.clear();
    }
  }
  static ɵprov = ɵɵdefineInjectable({
    token: _StandaloneService,
    providedIn: "environment",
    factory: () => new _StandaloneService(ɵɵinject(EnvironmentInjector))
  });
};
function ɵɵdefineComponent(componentDefinition) {
  return noSideEffects(() => {
    (typeof ngDevMode === "undefined" || ngDevMode) && initNgDevMode();
    const baseDef = getNgDirectiveDef(componentDefinition);
    const def = __spreadProps(__spreadValues({}, baseDef), {
      decls: componentDefinition.decls,
      vars: componentDefinition.vars,
      template: componentDefinition.template,
      consts: componentDefinition.consts || null,
      ngContentSelectors: componentDefinition.ngContentSelectors,
      onPush: componentDefinition.changeDetection === ChangeDetectionStrategy.OnPush,
      directiveDefs: null,
      pipeDefs: null,
      dependencies: baseDef.standalone && componentDefinition.dependencies || null,
      getStandaloneInjector: baseDef.standalone ? (parentInjector) => {
        return parentInjector.get(StandaloneService).getOrCreateStandaloneInjector(def);
      } : null,
      getExternalStyles: null,
      signals: componentDefinition.signals ?? false,
      data: componentDefinition.data || {},
      encapsulation: componentDefinition.encapsulation || ViewEncapsulation.Emulated,
      styles: componentDefinition.styles || EMPTY_ARRAY,
      _: null,
      schemas: componentDefinition.schemas || null,
      tView: null,
      id: ""
    });
    if (baseDef.standalone) {
      performanceMarkFeature("NgStandalone");
    }
    initFeatures(def);
    const dependencies = componentDefinition.dependencies;
    def.directiveDefs = extractDefListOrFactory(dependencies, extractDirectiveDef);
    def.pipeDefs = extractDefListOrFactory(dependencies, getPipeDef);
    def.id = getComponentId(def);
    return def;
  });
}
function extractDirectiveDef(type) {
  return getComponentDef(type) || getDirectiveDef(type);
}
function ɵɵdefineNgModule(def) {
  return noSideEffects(() => {
    const res = {
      type: def.type,
      bootstrap: def.bootstrap || EMPTY_ARRAY,
      declarations: def.declarations || EMPTY_ARRAY,
      imports: def.imports || EMPTY_ARRAY,
      exports: def.exports || EMPTY_ARRAY,
      transitiveCompileScopes: null,
      schemas: def.schemas || null,
      id: def.id || null
    };
    return res;
  });
}
function parseAndConvertInputsForDefinition(obj, declaredInputs) {
  if (obj == null) return EMPTY_OBJ;
  const newLookup = {};
  for (const minifiedKey in obj) {
    if (obj.hasOwnProperty(minifiedKey)) {
      const value = obj[minifiedKey];
      let publicName;
      let declaredName;
      let inputFlags;
      let transform;
      if (Array.isArray(value)) {
        inputFlags = value[0];
        publicName = value[1];
        declaredName = value[2] ?? publicName;
        transform = value[3] || null;
      } else {
        publicName = value;
        declaredName = value;
        inputFlags = InputFlags.None;
        transform = null;
      }
      newLookup[publicName] = [minifiedKey, inputFlags, transform];
      declaredInputs[publicName] = declaredName;
    }
  }
  return newLookup;
}
function parseAndConvertOutputsForDefinition(obj) {
  if (obj == null) return EMPTY_OBJ;
  const newLookup = {};
  for (const minifiedKey in obj) {
    if (obj.hasOwnProperty(minifiedKey)) {
      newLookup[obj[minifiedKey]] = minifiedKey;
    }
  }
  return newLookup;
}
function ɵɵdefineDirective(directiveDefinition) {
  return noSideEffects(() => {
    const def = getNgDirectiveDef(directiveDefinition);
    initFeatures(def);
    return def;
  });
}
function ɵɵdefinePipe(pipeDef) {
  return {
    type: pipeDef.type,
    name: pipeDef.name,
    factory: null,
    pure: pipeDef.pure !== false,
    standalone: pipeDef.standalone ?? true,
    onDestroy: pipeDef.type.prototype.ngOnDestroy || null
  };
}
function getNgDirectiveDef(directiveDefinition) {
  const declaredInputs = {};
  return {
    type: directiveDefinition.type,
    providersResolver: null,
    viewProvidersResolver: null,
    factory: null,
    hostBindings: directiveDefinition.hostBindings || null,
    hostVars: directiveDefinition.hostVars || 0,
    hostAttrs: directiveDefinition.hostAttrs || null,
    contentQueries: directiveDefinition.contentQueries || null,
    declaredInputs,
    inputConfig: directiveDefinition.inputs || EMPTY_OBJ,
    exportAs: directiveDefinition.exportAs || null,
    standalone: directiveDefinition.standalone ?? true,
    signals: directiveDefinition.signals === true,
    selectors: directiveDefinition.selectors || EMPTY_ARRAY,
    viewQuery: directiveDefinition.viewQuery || null,
    features: directiveDefinition.features || null,
    setInput: null,
    resolveHostDirectives: null,
    hostDirectives: null,
    inputs: parseAndConvertInputsForDefinition(directiveDefinition.inputs, declaredInputs),
    outputs: parseAndConvertOutputsForDefinition(directiveDefinition.outputs),
    debugInfo: null
  };
}
function initFeatures(definition) {
  definition.features?.forEach((fn) => fn(definition));
}
function extractDefListOrFactory(dependencies, defExtractor) {
  if (!dependencies) {
    return null;
  }
  return () => {
    const resolvedDependencies = typeof dependencies === "function" ? dependencies() : dependencies;
    const result = [];
    for (const dep of resolvedDependencies) {
      const definition = defExtractor(dep);
      if (definition !== null) {
        result.push(definition);
      }
    }
    return result;
  };
}
var GENERATED_COMP_IDS = /* @__PURE__ */ new Map();
function getComponentId(componentDef) {
  let hash = 0;
  const componentDefConsts = typeof componentDef.consts === "function" ? "" : componentDef.consts;
  const hashSelectors = [componentDef.selectors, componentDef.ngContentSelectors, componentDef.hostVars, componentDef.hostAttrs, componentDefConsts, componentDef.vars, componentDef.decls, componentDef.encapsulation, componentDef.standalone, componentDef.signals, componentDef.exportAs, JSON.stringify(componentDef.inputs), JSON.stringify(componentDef.outputs), Object.getOwnPropertyNames(componentDef.type.prototype), !!componentDef.contentQueries, !!componentDef.viewQuery];
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    for (const item of hashSelectors) {
      assertNotEqual(typeof item, "function", "Internal error: attempting to use a function in component id computation logic.");
    }
  }
  for (const char of hashSelectors.join("|")) {
    hash = Math.imul(31, hash) + char.charCodeAt(0) << 0;
  }
  hash += 2147483647 + 1;
  const compId = "c" + hash;
  if ((typeof ngDevMode === "undefined" || ngDevMode) && true) {
    if (GENERATED_COMP_IDS.has(compId)) {
      const previousCompDefType = GENERATED_COMP_IDS.get(compId);
      if (previousCompDefType !== componentDef.type) {
        console.warn(formatRuntimeError(-912, `Component ID generation collision detected. Components '${previousCompDefType.name}' and '${componentDef.type.name}' with selector '${stringifyCSSSelectorList(componentDef.selectors)}' generated the same component ID. To fix this, you can change the selector of one of those components or add an extra host attribute to force a different ID.`));
      }
    } else {
      GENERATED_COMP_IDS.set(compId, componentDef.type);
    }
  }
  return compId;
}
function ɵɵHostDirectivesFeature(rawHostDirectives) {
  const feature = (definition) => {
    const isEager = Array.isArray(rawHostDirectives);
    if (definition.hostDirectives === null) {
      definition.resolveHostDirectives = resolveHostDirectives;
      definition.hostDirectives = isEager ? rawHostDirectives.map(createHostDirectiveDef) : [rawHostDirectives];
    } else if (isEager) {
      definition.hostDirectives.unshift(...rawHostDirectives.map(createHostDirectiveDef));
    } else {
      definition.hostDirectives.unshift(rawHostDirectives);
    }
  };
  feature.ngInherit = true;
  return feature;
}
function resolveHostDirectives(matches) {
  const allDirectiveDefs = [];
  let hasComponent = false;
  let hostDirectiveDefs = null;
  let hostDirectiveRanges = null;
  for (let i = 0; i < matches.length; i++) {
    const def = matches[i];
    if (def.hostDirectives !== null) {
      const start = allDirectiveDefs.length;
      hostDirectiveDefs ??= /* @__PURE__ */ new Map();
      hostDirectiveRanges ??= /* @__PURE__ */ new Map();
      findHostDirectiveDefs(def, allDirectiveDefs, hostDirectiveDefs);
      hostDirectiveRanges.set(def, [start, allDirectiveDefs.length - 1]);
    }
    if (i === 0 && isComponentDef(def)) {
      hasComponent = true;
      allDirectiveDefs.push(def);
    }
  }
  for (let i = hasComponent ? 1 : 0; i < matches.length; i++) {
    allDirectiveDefs.push(matches[i]);
  }
  return [allDirectiveDefs, hostDirectiveDefs, hostDirectiveRanges];
}
function findHostDirectiveDefs(currentDef, matchedDefs, hostDirectiveDefs) {
  if (currentDef.hostDirectives !== null) {
    for (const configOrFn of currentDef.hostDirectives) {
      if (typeof configOrFn === "function") {
        const resolved = configOrFn();
        for (const config of resolved) {
          trackHostDirectiveDef(createHostDirectiveDef(config), matchedDefs, hostDirectiveDefs);
        }
      } else {
        trackHostDirectiveDef(configOrFn, matchedDefs, hostDirectiveDefs);
      }
    }
  }
}
function trackHostDirectiveDef(def, matchedDefs, hostDirectiveDefs) {
  const hostDirectiveDef = getDirectiveDef(def.directive);
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    validateHostDirective(def, hostDirectiveDef);
  }
  patchDeclaredInputs(hostDirectiveDef.declaredInputs, def.inputs);
  findHostDirectiveDefs(hostDirectiveDef, matchedDefs, hostDirectiveDefs);
  hostDirectiveDefs.set(hostDirectiveDef, def);
  matchedDefs.push(hostDirectiveDef);
}
function createHostDirectiveDef(config) {
  return typeof config === "function" ? {
    directive: resolveForwardRef(config),
    inputs: EMPTY_OBJ,
    outputs: EMPTY_OBJ
  } : {
    directive: resolveForwardRef(config.directive),
    inputs: bindingArrayToMap(config.inputs),
    outputs: bindingArrayToMap(config.outputs)
  };
}
function bindingArrayToMap(bindings) {
  if (bindings === void 0 || bindings.length === 0) {
    return EMPTY_OBJ;
  }
  const result = {};
  for (let i = 0; i < bindings.length; i += 2) {
    result[bindings[i]] = bindings[i + 1];
  }
  return result;
}
function patchDeclaredInputs(declaredInputs, exposedInputs) {
  for (const publicName in exposedInputs) {
    if (exposedInputs.hasOwnProperty(publicName)) {
      const remappedPublicName = exposedInputs[publicName];
      const privateName = declaredInputs[publicName];
      if ((typeof ngDevMode === "undefined" || ngDevMode) && declaredInputs.hasOwnProperty(remappedPublicName)) {
        assertEqual(declaredInputs[remappedPublicName], declaredInputs[publicName], `Conflicting host directive input alias ${publicName}.`);
      }
      declaredInputs[remappedPublicName] = privateName;
    }
  }
}
function validateHostDirective(hostDirectiveConfig, directiveDef) {
  const type = hostDirectiveConfig.directive;
  if (directiveDef === null) {
    if (getComponentDef(type) !== null) {
      throw new RuntimeError(310, `Host directive ${type.name} cannot be a component.`);
    }
    throw new RuntimeError(307, `Could not resolve metadata for host directive ${type.name}. Make sure that the ${type.name} class is annotated with an @Directive decorator.`);
  }
  if (!directiveDef.standalone) {
    throw new RuntimeError(308, `Host directive ${directiveDef.type.name} must be standalone.`);
  }
  validateMappings("input", directiveDef, hostDirectiveConfig.inputs);
  validateMappings("output", directiveDef, hostDirectiveConfig.outputs);
}
function validateMappings(bindingType, def, hostDirectiveBindings) {
  const className = def.type.name;
  const bindings = bindingType === "input" ? def.inputs : def.outputs;
  for (const publicName in hostDirectiveBindings) {
    if (hostDirectiveBindings.hasOwnProperty(publicName)) {
      if (!bindings.hasOwnProperty(publicName)) {
        throw new RuntimeError(311, `Directive ${className} does not have an ${bindingType} with a public name of ${publicName}.`);
      }
      const remappedPublicName = hostDirectiveBindings[publicName];
      if (bindings.hasOwnProperty(remappedPublicName) && remappedPublicName !== publicName) {
        throw new RuntimeError(312, `Cannot alias ${bindingType} ${publicName} of host directive ${className} to ${remappedPublicName}, because it already has a different ${bindingType} with the same public name.`);
      }
    }
  }
}
function getSuperType(type) {
  return Object.getPrototypeOf(type.prototype).constructor;
}
function ɵɵInheritDefinitionFeature(definition) {
  let superType = getSuperType(definition.type);
  let shouldInheritFields = true;
  const inheritanceChain = [definition];
  while (superType) {
    let superDef = void 0;
    if (isComponentDef(definition)) {
      superDef = superType.ɵcmp || superType.ɵdir;
    } else {
      if (superType.ɵcmp) {
        throw new RuntimeError(903, ngDevMode && `Directives cannot inherit Components. Directive ${stringifyForError(definition.type)} is attempting to extend component ${stringifyForError(superType)}`);
      }
      superDef = superType.ɵdir;
    }
    if (superDef) {
      if (shouldInheritFields) {
        inheritanceChain.push(superDef);
        const writeableDef = definition;
        writeableDef.inputs = maybeUnwrapEmpty(definition.inputs);
        writeableDef.declaredInputs = maybeUnwrapEmpty(definition.declaredInputs);
        writeableDef.outputs = maybeUnwrapEmpty(definition.outputs);
        const superHostBindings = superDef.hostBindings;
        superHostBindings && inheritHostBindings(definition, superHostBindings);
        const superViewQuery = superDef.viewQuery;
        const superContentQueries = superDef.contentQueries;
        superViewQuery && inheritViewQuery(definition, superViewQuery);
        superContentQueries && inheritContentQueries(definition, superContentQueries);
        mergeInputsWithTransforms(definition, superDef);
        fillProperties(definition.outputs, superDef.outputs);
        if (isComponentDef(superDef) && superDef.data.animation) {
          const defData = definition.data;
          defData.animation = (defData.animation || []).concat(superDef.data.animation);
        }
      }
      const features = superDef.features;
      if (features) {
        for (let i = 0; i < features.length; i++) {
          const feature = features[i];
          if (feature && feature.ngInherit) {
            feature(definition);
          }
          if (feature === ɵɵInheritDefinitionFeature) {
            shouldInheritFields = false;
          }
        }
      }
    }
    superType = Object.getPrototypeOf(superType);
  }
  mergeHostAttrsAcrossInheritance(inheritanceChain);
}
function mergeInputsWithTransforms(target, source) {
  for (const key in source.inputs) {
    if (!source.inputs.hasOwnProperty(key)) {
      continue;
    }
    if (target.inputs.hasOwnProperty(key)) {
      continue;
    }
    const value = source.inputs[key];
    if (value !== void 0) {
      target.inputs[key] = value;
      target.declaredInputs[key] = source.declaredInputs[key];
    }
  }
}
function mergeHostAttrsAcrossInheritance(inheritanceChain) {
  let hostVars = 0;
  let hostAttrs = null;
  for (let i = inheritanceChain.length - 1; i >= 0; i--) {
    const def = inheritanceChain[i];
    def.hostVars = hostVars += def.hostVars;
    def.hostAttrs = mergeHostAttrs(def.hostAttrs, hostAttrs = mergeHostAttrs(hostAttrs, def.hostAttrs));
  }
}
function maybeUnwrapEmpty(value) {
  if (value === EMPTY_OBJ) {
    return {};
  } else if (value === EMPTY_ARRAY) {
    return [];
  } else {
    return value;
  }
}
function inheritViewQuery(definition, superViewQuery) {
  const prevViewQuery = definition.viewQuery;
  if (prevViewQuery) {
    definition.viewQuery = (rf, ctx) => {
      superViewQuery(rf, ctx);
      prevViewQuery(rf, ctx);
    };
  } else {
    definition.viewQuery = superViewQuery;
  }
}
function inheritContentQueries(definition, superContentQueries) {
  const prevContentQueries = definition.contentQueries;
  if (prevContentQueries) {
    definition.contentQueries = (rf, ctx, directiveIndex) => {
      superContentQueries(rf, ctx, directiveIndex);
      prevContentQueries(rf, ctx, directiveIndex);
    };
  } else {
    definition.contentQueries = superContentQueries;
  }
}
function inheritHostBindings(definition, superHostBindings) {
  const prevHostBindings = definition.hostBindings;
  if (prevHostBindings) {
    definition.hostBindings = (rf, ctx) => {
      superHostBindings(rf, ctx);
      prevHostBindings(rf, ctx);
    };
  } else {
    definition.hostBindings = superHostBindings;
  }
}
function templateCreate(tNode, declarationLView, declarationTView, index, templateFn, decls, vars, flags) {
  if (declarationTView.firstCreatePass) {
    tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, tNode.attrs);
    const embeddedTView = tNode.tView = createTView(2, tNode, templateFn, decls, vars, declarationTView.directiveRegistry, declarationTView.pipeRegistry, null, declarationTView.schemas, declarationTView.consts, null);
    if (declarationTView.queries !== null) {
      declarationTView.queries.template(declarationTView, tNode);
      embeddedTView.queries = declarationTView.queries.embeddedTView(tNode);
    }
  }
  if (flags) {
    tNode.flags |= flags;
  }
  setCurrentTNode(tNode, false);
  const comment = _locateOrCreateContainerAnchor(declarationTView, declarationLView, tNode, index);
  if (wasLastNodeCreated()) {
    appendChild(declarationTView, declarationLView, comment, tNode);
  }
  attachPatchData(comment, declarationLView);
  const lContainer = createLContainer(comment, declarationLView, comment, tNode);
  declarationLView[index + HEADER_OFFSET] = lContainer;
  addToEndOfViewTree(declarationLView, lContainer);
  populateDehydratedViewsInLContainer(lContainer, tNode, declarationLView);
}
function declareDirectiveHostTemplate(declarationLView, declarationTView, index, templateFn, decls, vars, tagName, attrs, flags, localRefsIndex, localRefExtractor) {
  const adjustedIndex = index + HEADER_OFFSET;
  let tNode;
  if (declarationTView.firstCreatePass) {
    tNode = getOrCreateTNode(declarationTView, adjustedIndex, 4, tagName || null, attrs || null);
    if (getBindingsEnabled()) {
      resolveDirectives(declarationTView, declarationLView, tNode, getConstant(declarationTView.consts, localRefsIndex), findDirectiveDefMatches);
    }
    registerPostOrderHooks(declarationTView, tNode);
  } else {
    tNode = declarationTView.data[adjustedIndex];
  }
  templateCreate(tNode, declarationLView, declarationTView, index, templateFn, decls, vars, flags);
  if (isDirectiveHost(tNode)) {
    createDirectivesInstances(declarationTView, declarationLView, tNode);
  }
  if (localRefsIndex != null) {
    saveResolvedLocalsInData(declarationLView, tNode, localRefExtractor);
  }
  return tNode;
}
function declareNoDirectiveHostTemplate(declarationLView, declarationTView, index, templateFn, decls, vars, tagName, attrs, flags, localRefsIndex, localRefExtractor) {
  const adjustedIndex = index + HEADER_OFFSET;
  let tNode;
  if (declarationTView.firstCreatePass) {
    tNode = getOrCreateTNode(declarationTView, adjustedIndex, 4, tagName || null, attrs || null);
    if (localRefsIndex != null) {
      const refs = getConstant(declarationTView.consts, localRefsIndex);
      tNode.localNames = [];
      for (let i = 0; i < refs.length; i += 2) {
        tNode.localNames.push(refs[i], -1);
      }
    }
  } else {
    tNode = declarationTView.data[adjustedIndex];
  }
  templateCreate(tNode, declarationLView, declarationTView, index, templateFn, decls, vars, flags);
  if (localRefsIndex != null) {
    saveResolvedLocalsInData(declarationLView, tNode, localRefExtractor);
  }
  return tNode;
}
function ɵɵtemplate(index, templateFn, decls, vars, tagName, attrsIndex, localRefsIndex, localRefExtractor) {
  const lView = getLView();
  const tView = getTView();
  const attrs = getConstant(tView.consts, attrsIndex);
  declareDirectiveHostTemplate(lView, tView, index, templateFn, decls, vars, tagName, attrs, void 0, localRefsIndex, localRefExtractor);
  return ɵɵtemplate;
}
function ɵɵdomTemplate(index, templateFn, decls, vars, tagName, attrsIndex, localRefsIndex, localRefExtractor) {
  const lView = getLView();
  const tView = getTView();
  const attrs = getConstant(tView.consts, attrsIndex);
  declareNoDirectiveHostTemplate(lView, tView, index, templateFn, decls, vars, tagName, attrs, void 0, localRefsIndex, localRefExtractor);
  return ɵɵdomTemplate;
}
var _locateOrCreateContainerAnchor = createContainerAnchorImpl;
function createContainerAnchorImpl(tView, lView, tNode, index) {
  lastNodeWasCreated(true);
  return lView[RENDERER].createComment(ngDevMode ? "container" : "");
}
function locateOrCreateContainerAnchorImpl(tView, lView, tNode, index) {
  const isNodeCreationMode = !canHydrateNode(lView, tNode);
  lastNodeWasCreated(isNodeCreationMode);
  const ssrId = lView[HYDRATION]?.data[TEMPLATES]?.[index] ?? null;
  if (ssrId !== null && tNode.tView !== null) {
    if (tNode.tView.ssrId === null) {
      tNode.tView.ssrId = ssrId;
    } else {
      ngDevMode && assertEqual(tNode.tView.ssrId, ssrId, "Unexpected value of the `ssrId` for this TView");
    }
  }
  if (isNodeCreationMode) {
    return createContainerAnchorImpl(tView, lView);
  }
  const hydrationInfo = lView[HYDRATION];
  const currentRNode = locateNextRNode(hydrationInfo, tView, lView, tNode);
  ngDevMode && validateNodeExists(currentRNode, lView, tNode);
  setSegmentHead(hydrationInfo, index, currentRNode);
  const viewContainerSize = calcSerializedContainerSize(hydrationInfo, index);
  const comment = siblingAfter(viewContainerSize, currentRNode);
  if (ngDevMode) {
    validateMatchingNode(comment, Node.COMMENT_NODE, null, lView, tNode);
    markRNodeAsClaimedByHydration(comment);
  }
  return comment;
}
function enableLocateOrCreateContainerAnchorImpl() {
  _locateOrCreateContainerAnchor = locateOrCreateContainerAnchorImpl;
}
var DeferDependenciesLoadingState;
(function(DeferDependenciesLoadingState2) {
  DeferDependenciesLoadingState2[DeferDependenciesLoadingState2["NOT_STARTED"] = 0] = "NOT_STARTED";
  DeferDependenciesLoadingState2[DeferDependenciesLoadingState2["IN_PROGRESS"] = 1] = "IN_PROGRESS";
  DeferDependenciesLoadingState2[DeferDependenciesLoadingState2["COMPLETE"] = 2] = "COMPLETE";
  DeferDependenciesLoadingState2[DeferDependenciesLoadingState2["FAILED"] = 3] = "FAILED";
})(DeferDependenciesLoadingState || (DeferDependenciesLoadingState = {}));
var MINIMUM_SLOT = 0;
var LOADING_AFTER_SLOT = 1;
var DeferBlockState;
(function(DeferBlockState2) {
  DeferBlockState2[DeferBlockState2["Placeholder"] = 0] = "Placeholder";
  DeferBlockState2[DeferBlockState2["Loading"] = 1] = "Loading";
  DeferBlockState2[DeferBlockState2["Complete"] = 2] = "Complete";
  DeferBlockState2[DeferBlockState2["Error"] = 3] = "Error";
})(DeferBlockState || (DeferBlockState = {}));
var DeferBlockInternalState;
(function(DeferBlockInternalState2) {
  DeferBlockInternalState2[DeferBlockInternalState2["Initial"] = -1] = "Initial";
})(DeferBlockInternalState || (DeferBlockInternalState = {}));
var NEXT_DEFER_BLOCK_STATE = 0;
var DEFER_BLOCK_STATE = 1;
var STATE_IS_FROZEN_UNTIL = 2;
var LOADING_AFTER_CLEANUP_FN = 3;
var TRIGGER_CLEANUP_FNS = 4;
var PREFETCH_TRIGGER_CLEANUP_FNS = 5;
var SSR_UNIQUE_ID = 6;
var SSR_BLOCK_STATE = 7;
var ON_COMPLETE_FNS = 8;
var HYDRATE_TRIGGER_CLEANUP_FNS = 9;
var DeferBlockBehavior;
(function(DeferBlockBehavior2) {
  DeferBlockBehavior2[DeferBlockBehavior2["Manual"] = 0] = "Manual";
  DeferBlockBehavior2[DeferBlockBehavior2["Playthrough"] = 1] = "Playthrough";
})(DeferBlockBehavior || (DeferBlockBehavior = {}));
function storeTriggerCleanupFn(type, lDetails, cleanupFn) {
  const key = getCleanupFnKeyByType(type);
  if (lDetails[key] === null) {
    lDetails[key] = [];
  }
  lDetails[key].push(cleanupFn);
}
function invokeTriggerCleanupFns(type, lDetails) {
  const key = getCleanupFnKeyByType(type);
  const cleanupFns = lDetails[key];
  if (cleanupFns !== null) {
    for (const cleanupFn of cleanupFns) {
      cleanupFn();
    }
    lDetails[key] = null;
  }
}
function invokeAllTriggerCleanupFns(lDetails) {
  invokeTriggerCleanupFns(1, lDetails);
  invokeTriggerCleanupFns(0, lDetails);
  invokeTriggerCleanupFns(2, lDetails);
}
function getCleanupFnKeyByType(type) {
  let key = TRIGGER_CLEANUP_FNS;
  if (type === 1) {
    key = PREFETCH_TRIGGER_CLEANUP_FNS;
  } else if (type === 2) {
    key = HYDRATE_TRIGGER_CLEANUP_FNS;
  }
  return key;
}
function getDeferBlockDataIndex(deferBlockIndex) {
  return deferBlockIndex + 1;
}
function getLDeferBlockDetails(lView, tNode) {
  const tView = lView[TVIEW];
  const slotIndex = getDeferBlockDataIndex(tNode.index);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  return lView[slotIndex];
}
function setLDeferBlockDetails(lView, deferBlockIndex, lDetails) {
  const tView = lView[TVIEW];
  const slotIndex = getDeferBlockDataIndex(deferBlockIndex);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  lView[slotIndex] = lDetails;
}
function getTDeferBlockDetails(tView, tNode) {
  const slotIndex = getDeferBlockDataIndex(tNode.index);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  return tView.data[slotIndex];
}
function setTDeferBlockDetails(tView, deferBlockIndex, deferBlockConfig) {
  const slotIndex = getDeferBlockDataIndex(deferBlockIndex);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  tView.data[slotIndex] = deferBlockConfig;
}
function getTemplateIndexForState(newState, hostLView, tNode) {
  const tView = hostLView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);
  switch (newState) {
    case DeferBlockState.Complete:
      return tDetails.primaryTmplIndex;
    case DeferBlockState.Loading:
      return tDetails.loadingTmplIndex;
    case DeferBlockState.Error:
      return tDetails.errorTmplIndex;
    case DeferBlockState.Placeholder:
      return tDetails.placeholderTmplIndex;
    default:
      ngDevMode && throwError(`Unexpected defer block state: ${newState}`);
      return null;
  }
}
function getMinimumDurationForState(tDetails, currentState) {
  if (currentState === DeferBlockState.Placeholder) {
    return tDetails.placeholderBlockConfig?.[MINIMUM_SLOT] ?? null;
  } else if (currentState === DeferBlockState.Loading) {
    return tDetails.loadingBlockConfig?.[MINIMUM_SLOT] ?? null;
  }
  return null;
}
function getLoadingBlockAfter(tDetails) {
  return tDetails.loadingBlockConfig?.[LOADING_AFTER_SLOT] ?? null;
}
function addDepsToRegistry(currentDeps, newDeps) {
  if (!currentDeps || currentDeps.length === 0) {
    return newDeps;
  }
  const currentDepSet = new Set(currentDeps);
  for (const dep of newDeps) {
    currentDepSet.add(dep);
  }
  return currentDeps.length === currentDepSet.size ? currentDeps : Array.from(currentDepSet);
}
function getPrimaryBlockTNode(tView, tDetails) {
  const adjustedIndex = tDetails.primaryTmplIndex + HEADER_OFFSET;
  return getTNode(tView, adjustedIndex);
}
function assertDeferredDependenciesLoaded(tDetails) {
  assertEqual(tDetails.loadingState, DeferDependenciesLoadingState.COMPLETE, "Expecting all deferred dependencies to be loaded.");
}
function isTDeferBlockDetails(value) {
  return value !== null && typeof value === "object" && typeof value.primaryTmplIndex === "number";
}
function isDeferBlock(tView, tNode) {
  let tDetails = null;
  const slotIndex = getDeferBlockDataIndex(tNode.index);
  if (HEADER_OFFSET < slotIndex && slotIndex < tView.bindingStartIndex) {
    tDetails = getTDeferBlockDetails(tView, tNode);
  }
  return !!tDetails && isTDeferBlockDetails(tDetails);
}
function trackTriggerForDebugging(tView, tNode, textRepresentation) {
  const tDetails = getTDeferBlockDetails(tView, tNode);
  tDetails.debug ??= {};
  tDetails.debug.triggers ??= /* @__PURE__ */ new Set();
  tDetails.debug.triggers.add(textRepresentation);
}
function onViewportWrapper(trigger, callback, injector, wrapperOptions) {
  const ngZone = injector.get(NgZone);
  return onViewport(trigger, () => ngZone.run(callback), (options) => ngZone.runOutsideAngular(() => createIntersectionObserver(options)), wrapperOptions);
}
function getTriggerLView(deferredHostLView, deferredTNode, walkUpTimes) {
  if (walkUpTimes == null) {
    return deferredHostLView;
  }
  if (walkUpTimes >= 0) {
    return walkUpViews(walkUpTimes, deferredHostLView);
  }
  const deferredContainer = deferredHostLView[deferredTNode.index];
  ngDevMode && assertLContainer(deferredContainer);
  const triggerLView = deferredContainer[CONTAINER_HEADER_OFFSET] ?? null;
  if (ngDevMode && triggerLView !== null) {
    const lDetails = getLDeferBlockDetails(deferredHostLView, deferredTNode);
    const renderedState = lDetails[DEFER_BLOCK_STATE];
    assertEqual(renderedState, DeferBlockState.Placeholder, "Expected a placeholder to be rendered in this defer block.");
    assertLView(triggerLView);
  }
  return triggerLView;
}
function getTriggerElement(triggerLView, triggerIndex) {
  const element = getNativeByIndex(HEADER_OFFSET + triggerIndex, triggerLView);
  ngDevMode && assertElement(element);
  return element;
}
function registerDomTrigger(initialLView, tNode, triggerIndex, walkUpTimes, registerFn, callback, type, options) {
  const injector = initialLView[INJECTOR];
  const zone = injector.get(NgZone);
  let poll;
  function pollDomTrigger() {
    if (isDestroyed(initialLView)) {
      poll.destroy();
      return;
    }
    const lDetails = getLDeferBlockDetails(initialLView, tNode);
    const renderedState = lDetails[DEFER_BLOCK_STATE];
    if (renderedState !== DeferBlockInternalState.Initial && renderedState !== DeferBlockState.Placeholder) {
      poll.destroy();
      return;
    }
    const triggerLView = getTriggerLView(initialLView, tNode, walkUpTimes);
    if (!triggerLView) {
      return;
    }
    poll.destroy();
    if (isDestroyed(triggerLView)) {
      return;
    }
    const element = getTriggerElement(triggerLView, triggerIndex);
    const cleanup = registerFn(element, () => {
      zone.run(() => {
        if (initialLView !== triggerLView) {
          removeLViewOnDestroy(triggerLView, cleanup);
        }
        callback();
      });
    }, injector, options);
    if (initialLView !== triggerLView) {
      storeLViewOnDestroy(triggerLView, cleanup);
    }
    storeTriggerCleanupFn(type, lDetails, cleanup);
  }
  poll = afterEveryRender({
    read: pollDomTrigger
  }, {
    injector
  });
}
function onIdle(callback, injector) {
  const scheduler = injector.get(IdleScheduler);
  const cleanupFn = () => scheduler.remove(callback);
  scheduler.add(callback);
  return cleanupFn;
}
var _requestIdleCallback = () => typeof requestIdleCallback !== "undefined" ? requestIdleCallback : setTimeout;
var _cancelIdleCallback = () => typeof requestIdleCallback !== "undefined" ? cancelIdleCallback : clearTimeout;
var IdleScheduler = class _IdleScheduler {
  executingCallbacks = false;
  idleId = null;
  current = /* @__PURE__ */ new Set();
  deferred = /* @__PURE__ */ new Set();
  ngZone = inject(NgZone);
  requestIdleCallbackFn = _requestIdleCallback().bind(globalThis);
  cancelIdleCallbackFn = _cancelIdleCallback().bind(globalThis);
  add(callback) {
    const target = this.executingCallbacks ? this.deferred : this.current;
    target.add(callback);
    if (this.idleId === null) {
      this.scheduleIdleCallback();
    }
  }
  remove(callback) {
    const {
      current,
      deferred
    } = this;
    current.delete(callback);
    deferred.delete(callback);
    if (current.size === 0 && deferred.size === 0) {
      this.cancelIdleCallback();
    }
  }
  scheduleIdleCallback() {
    const callback = () => {
      this.cancelIdleCallback();
      this.executingCallbacks = true;
      for (const callback2 of this.current) {
        callback2();
      }
      this.current.clear();
      this.executingCallbacks = false;
      if (this.deferred.size > 0) {
        for (const callback2 of this.deferred) {
          this.current.add(callback2);
        }
        this.deferred.clear();
        this.scheduleIdleCallback();
      }
    };
    this.idleId = this.requestIdleCallbackFn(() => this.ngZone.run(callback));
  }
  cancelIdleCallback() {
    if (this.idleId !== null) {
      this.cancelIdleCallbackFn(this.idleId);
      this.idleId = null;
    }
  }
  ngOnDestroy() {
    this.cancelIdleCallback();
    this.current.clear();
    this.deferred.clear();
  }
  static ɵprov = ɵɵdefineInjectable({
    token: _IdleScheduler,
    providedIn: "root",
    factory: () => new _IdleScheduler()
  });
};
function onTimer(delay) {
  return (callback, injector) => scheduleTimerTrigger(delay, callback, injector);
}
function scheduleTimerTrigger(delay, callback, injector) {
  const scheduler = injector.get(TimerScheduler);
  const ngZone = injector.get(NgZone);
  const cleanupFn = () => scheduler.remove(callback);
  scheduler.add(delay, callback, ngZone);
  return cleanupFn;
}
var TimerScheduler = class _TimerScheduler {
  executingCallbacks = false;
  timeoutId = null;
  invokeTimerAt = null;
  current = [];
  deferred = [];
  add(delay, callback, ngZone) {
    const target = this.executingCallbacks ? this.deferred : this.current;
    this.addToQueue(target, Date.now() + delay, callback);
    this.scheduleTimer(ngZone);
  }
  remove(callback) {
    const {
      current,
      deferred
    } = this;
    const callbackIndex = this.removeFromQueue(current, callback);
    if (callbackIndex === -1) {
      this.removeFromQueue(deferred, callback);
    }
    if (current.length === 0 && deferred.length === 0) {
      this.clearTimeout();
    }
  }
  addToQueue(target, invokeAt, callback) {
    let insertAtIndex = target.length;
    for (let i = 0; i < target.length; i += 2) {
      const invokeQueuedCallbackAt = target[i];
      if (invokeQueuedCallbackAt > invokeAt) {
        insertAtIndex = i;
        break;
      }
    }
    arrayInsert2(target, insertAtIndex, invokeAt, callback);
  }
  removeFromQueue(target, callback) {
    let index = -1;
    for (let i = 0; i < target.length; i += 2) {
      const queuedCallback = target[i + 1];
      if (queuedCallback === callback) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      arraySplice(target, index, 2);
    }
    return index;
  }
  scheduleTimer(ngZone) {
    const callback = () => {
      this.clearTimeout();
      this.executingCallbacks = true;
      const current = [...this.current];
      const now = Date.now();
      for (let i = 0; i < current.length; i += 2) {
        const invokeAt = current[i];
        const callback2 = current[i + 1];
        if (invokeAt <= now) {
          callback2();
        } else {
          break;
        }
      }
      let lastCallbackIndex = -1;
      for (let i = 0; i < this.current.length; i += 2) {
        const invokeAt = this.current[i];
        if (invokeAt <= now) {
          lastCallbackIndex = i + 1;
        } else {
          break;
        }
      }
      if (lastCallbackIndex >= 0) {
        arraySplice(this.current, 0, lastCallbackIndex + 1);
      }
      this.executingCallbacks = false;
      if (this.deferred.length > 0) {
        for (let i = 0; i < this.deferred.length; i += 2) {
          const invokeAt = this.deferred[i];
          const callback2 = this.deferred[i + 1];
          this.addToQueue(this.current, invokeAt, callback2);
        }
        this.deferred.length = 0;
      }
      this.scheduleTimer(ngZone);
    };
    const FRAME_DURATION_MS = 16;
    if (this.current.length > 0) {
      const now = Date.now();
      const invokeAt = this.current[0];
      if (this.timeoutId === null || this.invokeTimerAt && this.invokeTimerAt - invokeAt > FRAME_DURATION_MS) {
        this.clearTimeout();
        const timeout = Math.max(invokeAt - now, FRAME_DURATION_MS);
        this.invokeTimerAt = invokeAt;
        this.timeoutId = ngZone.runOutsideAngular(() => {
          return setTimeout(() => ngZone.run(callback), timeout);
        });
      }
    }
  }
  clearTimeout() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  ngOnDestroy() {
    this.clearTimeout();
    this.current.length = 0;
    this.deferred.length = 0;
  }
  static ɵprov = ɵɵdefineInjectable({
    token: _TimerScheduler,
    providedIn: "root",
    factory: () => new _TimerScheduler()
  });
};
var CachedInjectorService = class _CachedInjectorService {
  cachedInjectors = /* @__PURE__ */ new Map();
  getOrCreateInjector(key, parentInjector, providers, debugName) {
    if (!this.cachedInjectors.has(key)) {
      const injector = providers.length > 0 ? createEnvironmentInjector(providers, parentInjector, debugName) : null;
      this.cachedInjectors.set(key, injector);
    }
    return this.cachedInjectors.get(key);
  }
  ngOnDestroy() {
    try {
      for (const injector of this.cachedInjectors.values()) {
        if (injector !== null) {
          injector.destroy();
        }
      }
    } finally {
      this.cachedInjectors.clear();
    }
  }
  static ɵprov = ɵɵdefineInjectable({
    token: _CachedInjectorService,
    providedIn: "environment",
    factory: () => new _CachedInjectorService()
  });
};
var DEFER_BLOCK_DEPENDENCY_INTERCEPTOR = new InjectionToken("DEFER_BLOCK_DEPENDENCY_INTERCEPTOR");
var DEFER_BLOCK_CONFIG = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "DEFER_BLOCK_CONFIG" : "");
function getOrCreateEnvironmentInjector(parentInjector, tDetails, providers) {
  return parentInjector.get(CachedInjectorService).getOrCreateInjector(tDetails, parentInjector, providers, ngDevMode ? "DeferBlock Injector" : "");
}
function createDeferBlockInjector(parentInjector, tDetails, providers) {
  if (parentInjector instanceof ChainedInjector) {
    const origInjector = parentInjector.injector;
    const parentEnvInjector2 = parentInjector.parentInjector;
    const envInjector = getOrCreateEnvironmentInjector(parentEnvInjector2, tDetails, providers);
    return new ChainedInjector(origInjector, envInjector);
  }
  const parentEnvInjector = parentInjector.get(EnvironmentInjector);
  if (parentEnvInjector !== parentInjector) {
    const envInjector = getOrCreateEnvironmentInjector(parentEnvInjector, tDetails, providers);
    return new ChainedInjector(parentInjector, envInjector);
  }
  return getOrCreateEnvironmentInjector(parentInjector, tDetails, providers);
}
function renderDeferBlockState(newState, tNode, lContainer, skipTimerScheduling = false) {
  const hostLView = lContainer[PARENT];
  const hostTView = hostLView[TVIEW];
  if (isDestroyed(hostLView)) return;
  ngDevMode && assertTNodeForLView(tNode, hostLView);
  const lDetails = getLDeferBlockDetails(hostLView, tNode);
  ngDevMode && assertDefined(lDetails, "Expected a defer block state defined");
  const currentState = lDetails[DEFER_BLOCK_STATE];
  const ssrState = lDetails[SSR_BLOCK_STATE];
  if (ssrState !== null && newState < ssrState) {
    return;
  }
  if (isValidStateChange(currentState, newState) && isValidStateChange(lDetails[NEXT_DEFER_BLOCK_STATE] ?? -1, newState)) {
    const tDetails = getTDeferBlockDetails(hostTView, tNode);
    const needsScheduling = !skipTimerScheduling && true && (getLoadingBlockAfter(tDetails) !== null || getMinimumDurationForState(tDetails, DeferBlockState.Loading) !== null || getMinimumDurationForState(tDetails, DeferBlockState.Placeholder));
    if (ngDevMode && needsScheduling) {
      assertDefined(applyDeferBlockStateWithSchedulingImpl, "Expected scheduling function to be defined");
    }
    const applyStateFn = needsScheduling ? applyDeferBlockStateWithSchedulingImpl : applyDeferBlockState;
    try {
      applyStateFn(newState, lDetails, lContainer, tNode, hostLView);
    } catch (error) {
      handleUncaughtError(hostLView, error);
    }
  }
}
function findMatchingDehydratedViewForDeferBlock(lContainer, lDetails) {
  const dehydratedViewIx = lContainer[DEHYDRATED_VIEWS]?.findIndex((view) => view.data[DEFER_BLOCK_STATE$1] === lDetails[DEFER_BLOCK_STATE]) ?? -1;
  const dehydratedView = dehydratedViewIx > -1 ? lContainer[DEHYDRATED_VIEWS][dehydratedViewIx] : null;
  return {
    dehydratedView,
    dehydratedViewIx
  };
}
function applyDeferBlockState(newState, lDetails, lContainer, tNode, hostLView) {
  profiler(ProfilerEvent.DeferBlockStateStart);
  const stateTmplIndex = getTemplateIndexForState(newState, hostLView, tNode);
  if (stateTmplIndex !== null) {
    lDetails[DEFER_BLOCK_STATE] = newState;
    const hostTView = hostLView[TVIEW];
    const adjustedIndex = stateTmplIndex + HEADER_OFFSET;
    const activeBlockTNode = getTNode(hostTView, adjustedIndex);
    const viewIndex = 0;
    removeLViewFromLContainer(lContainer, viewIndex);
    let injector;
    if (newState === DeferBlockState.Complete) {
      const tDetails = getTDeferBlockDetails(hostTView, tNode);
      const providers = tDetails.providers;
      if (providers && providers.length > 0) {
        injector = createDeferBlockInjector(hostLView[INJECTOR], tDetails, providers);
      }
    }
    const {
      dehydratedView,
      dehydratedViewIx
    } = findMatchingDehydratedViewForDeferBlock(lContainer, lDetails);
    const embeddedLView = createAndRenderEmbeddedLView(hostLView, activeBlockTNode, null, {
      injector,
      dehydratedView
    });
    addLViewToLContainer(lContainer, embeddedLView, viewIndex, shouldAddViewToDom(activeBlockTNode, dehydratedView));
    markViewDirty(embeddedLView, 2);
    if (dehydratedViewIx > -1) {
      lContainer[DEHYDRATED_VIEWS]?.splice(dehydratedViewIx, 1);
    }
    if ((newState === DeferBlockState.Complete || newState === DeferBlockState.Error) && Array.isArray(lDetails[ON_COMPLETE_FNS])) {
      for (const callback of lDetails[ON_COMPLETE_FNS]) {
        callback();
      }
      lDetails[ON_COMPLETE_FNS] = null;
    }
  }
  profiler(ProfilerEvent.DeferBlockStateEnd);
}
function applyDeferBlockStateWithScheduling(newState, lDetails, lContainer, tNode, hostLView) {
  const now = Date.now();
  const hostTView = hostLView[TVIEW];
  const tDetails = getTDeferBlockDetails(hostTView, tNode);
  if (lDetails[STATE_IS_FROZEN_UNTIL] === null || lDetails[STATE_IS_FROZEN_UNTIL] <= now) {
    lDetails[STATE_IS_FROZEN_UNTIL] = null;
    const loadingAfter = getLoadingBlockAfter(tDetails);
    const inLoadingAfterPhase = lDetails[LOADING_AFTER_CLEANUP_FN] !== null;
    if (newState === DeferBlockState.Loading && loadingAfter !== null && !inLoadingAfterPhase) {
      lDetails[NEXT_DEFER_BLOCK_STATE] = newState;
      const cleanupFn = scheduleDeferBlockUpdate(loadingAfter, lDetails, tNode, lContainer, hostLView);
      lDetails[LOADING_AFTER_CLEANUP_FN] = cleanupFn;
    } else {
      if (newState > DeferBlockState.Loading && inLoadingAfterPhase) {
        lDetails[LOADING_AFTER_CLEANUP_FN]();
        lDetails[LOADING_AFTER_CLEANUP_FN] = null;
        lDetails[NEXT_DEFER_BLOCK_STATE] = null;
      }
      applyDeferBlockState(newState, lDetails, lContainer, tNode, hostLView);
      const duration = getMinimumDurationForState(tDetails, newState);
      if (duration !== null) {
        lDetails[STATE_IS_FROZEN_UNTIL] = now + duration;
        scheduleDeferBlockUpdate(duration, lDetails, tNode, lContainer, hostLView);
      }
    }
  } else {
    lDetails[NEXT_DEFER_BLOCK_STATE] = newState;
  }
}
function scheduleDeferBlockUpdate(timeout, lDetails, tNode, lContainer, hostLView) {
  const callback = () => {
    const nextState = lDetails[NEXT_DEFER_BLOCK_STATE];
    lDetails[STATE_IS_FROZEN_UNTIL] = null;
    lDetails[NEXT_DEFER_BLOCK_STATE] = null;
    if (nextState !== null) {
      renderDeferBlockState(nextState, tNode, lContainer);
    }
  };
  return scheduleTimerTrigger(timeout, callback, hostLView[INJECTOR]);
}
function isValidStateChange(currentState, newState) {
  return currentState < newState;
}
function renderPlaceholder(lView, tNode) {
  const lContainer = lView[tNode.index];
  ngDevMode && assertLContainer(lContainer);
  renderDeferBlockState(DeferBlockState.Placeholder, tNode, lContainer);
}
function renderDeferStateAfterResourceLoading(tDetails, tNode, lContainer) {
  ngDevMode && assertDefined(tDetails.loadingPromise, "Expected loading Promise to exist on this defer block");
  tDetails.loadingPromise.then(() => {
    if (tDetails.loadingState === DeferDependenciesLoadingState.COMPLETE) {
      ngDevMode && assertDeferredDependenciesLoaded(tDetails);
      renderDeferBlockState(DeferBlockState.Complete, tNode, lContainer);
    } else if (tDetails.loadingState === DeferDependenciesLoadingState.FAILED) {
      renderDeferBlockState(DeferBlockState.Error, tNode, lContainer);
    }
  });
}
var applyDeferBlockStateWithSchedulingImpl = null;
function ɵɵdeferEnableTimerScheduling(tView, tDetails, placeholderConfigIndex, loadingConfigIndex) {
  const tViewConsts = tView.consts;
  if (placeholderConfigIndex != null) {
    tDetails.placeholderBlockConfig = getConstant(tViewConsts, placeholderConfigIndex);
  }
  if (loadingConfigIndex != null) {
    tDetails.loadingBlockConfig = getConstant(tViewConsts, loadingConfigIndex);
  }
  if (applyDeferBlockStateWithSchedulingImpl === null) {
    applyDeferBlockStateWithSchedulingImpl = applyDeferBlockStateWithScheduling;
  }
}
var ASYNC_COMPONENT_METADATA_FN = "__ngAsyncComponentMetadataFn__";
function getAsyncClassMetadataFn(type) {
  const componentClass = type;
  return componentClass[ASYNC_COMPONENT_METADATA_FN] ?? null;
}
function setClassMetadataAsync(type, dependencyLoaderFn, metadataSetterFn) {
  const componentClass = type;
  componentClass[ASYNC_COMPONENT_METADATA_FN] = () => Promise.all(dependencyLoaderFn()).then((dependencies) => {
    metadataSetterFn(...dependencies);
    componentClass[ASYNC_COMPONENT_METADATA_FN] = null;
    return dependencies;
  });
  return componentClass[ASYNC_COMPONENT_METADATA_FN];
}
function setClassMetadata(type, decorators, ctorParameters, propDecorators) {
  return noSideEffects(() => {
    const clazz = type;
    if (decorators !== null) {
      if (clazz.hasOwnProperty("decorators") && clazz.decorators !== void 0) {
        clazz.decorators.push(...decorators);
      } else {
        clazz.decorators = decorators;
      }
    }
    if (ctorParameters !== null) {
      clazz.ctorParameters = ctorParameters;
    }
    if (propDecorators !== null) {
      if (clazz.hasOwnProperty("propDecorators") && clazz.propDecorators !== void 0) {
        clazz.propDecorators = __spreadValues(__spreadValues({}, clazz.propDecorators), propDecorators);
      } else {
        clazz.propDecorators = propDecorators;
      }
    }
  });
}
var Console = class _Console {
  log(message) {
    console.log(message);
  }
  warn(message) {
    console.warn(message);
  }
  static ɵfac = function Console_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Console)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _Console,
    factory: _Console.ɵfac,
    providedIn: "platform"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Console, [{
    type: Injectable,
    args: [{
      providedIn: "platform"
    }]
  }], null, null);
})();
var DIDebugData = class {
  resolverToTokenToDependencies = /* @__PURE__ */ new WeakMap();
  resolverToProviders = /* @__PURE__ */ new WeakMap();
  resolverToEffects = /* @__PURE__ */ new WeakMap();
  standaloneInjectorToComponent = /* @__PURE__ */ new WeakMap();
  reset() {
    this.resolverToTokenToDependencies = /* @__PURE__ */ new WeakMap();
    this.resolverToProviders = /* @__PURE__ */ new WeakMap();
    this.standaloneInjectorToComponent = /* @__PURE__ */ new WeakMap();
  }
};
var frameworkDIDebugData = new DIDebugData();
function getFrameworkDIDebugData() {
  return frameworkDIDebugData;
}
function setupFrameworkInjectorProfiler() {
  frameworkDIDebugData.reset();
  setInjectorProfiler(injectorProfilerEventHandler);
}
function injectorProfilerEventHandler(injectorProfilerEvent) {
  const {
    context,
    type
  } = injectorProfilerEvent;
  if (type === 0) {
    handleInjectEvent(context, injectorProfilerEvent.service);
  } else if (type === 1) {
    handleInstanceCreatedByInjectorEvent(context, injectorProfilerEvent.instance);
  } else if (type === 2) {
    handleProviderConfiguredEvent(context, injectorProfilerEvent.providerRecord);
  } else if (type === 3) {
    handleEffectCreatedEvent(context, injectorProfilerEvent.effect);
  } else if (type === 4) {
    handleEffectCreatedEvent(context, injectorProfilerEvent.effectPhase);
  }
}
function handleEffectCreatedEvent(context, effect2) {
  const diResolver = getDIResolver(context.injector);
  if (diResolver === null) {
    throwError("An EffectCreated event must be run within an injection context.");
  }
  const {
    resolverToEffects
  } = frameworkDIDebugData;
  const cleanupContainer = effect2 instanceof EffectRefImpl ? effect2[SIGNAL] : effect2.sequence;
  let trackedEffects = resolverToEffects.get(diResolver);
  if (!trackedEffects) {
    trackedEffects = [];
    resolverToEffects.set(diResolver, trackedEffects);
  }
  trackedEffects.push(effect2);
  cleanupContainer.onDestroyFns ??= [];
  cleanupContainer.onDestroyFns.push(() => {
    const index = trackedEffects.indexOf(effect2);
    if (index > -1) {
      trackedEffects.splice(index, 1);
    }
  });
}
function handleInjectEvent(context, data) {
  const diResolver = getDIResolver(context.injector);
  if (diResolver === null) {
    throwError("An Inject event must be run within an injection context.");
  }
  const diResolverToInstantiatedToken = frameworkDIDebugData.resolverToTokenToDependencies;
  if (!diResolverToInstantiatedToken.has(diResolver)) {
    diResolverToInstantiatedToken.set(diResolver, /* @__PURE__ */ new WeakMap());
  }
  if (!canBeHeldWeakly(context.token)) {
    return;
  }
  const instantiatedTokenToDependencies = diResolverToInstantiatedToken.get(diResolver);
  if (!instantiatedTokenToDependencies.has(context.token)) {
    instantiatedTokenToDependencies.set(context.token, []);
  }
  const {
    token,
    value,
    flags
  } = data;
  assertDefined(context.token, "Injector profiler context token is undefined.");
  const dependencies = instantiatedTokenToDependencies.get(context.token);
  assertDefined(dependencies, "Could not resolve dependencies for token.");
  if (context.injector instanceof NodeInjector) {
    dependencies.push({
      token,
      value,
      flags,
      injectedIn: getNodeInjectorContext(context.injector)
    });
  } else {
    dependencies.push({
      token,
      value,
      flags
    });
  }
}
function getNodeInjectorContext(injector) {
  if (!(injector instanceof NodeInjector)) {
    throwError("getNodeInjectorContext must be called with a NodeInjector");
  }
  const lView = getNodeInjectorLView(injector);
  const tNode = getNodeInjectorTNode(injector);
  if (tNode === null) {
    return;
  }
  assertTNodeForLView(tNode, lView);
  return {
    lView,
    tNode
  };
}
function handleInstanceCreatedByInjectorEvent(context, data) {
  const {
    value
  } = data;
  if (data.value == null) {
    return;
  }
  if (getDIResolver(context.injector) === null) {
    throwError("An InjectorCreatedInstance event must be run within an injection context.");
  }
  let standaloneComponent = void 0;
  if (typeof value === "object") {
    standaloneComponent = value?.constructor;
  }
  if (standaloneComponent == void 0 || !isStandaloneComponent(standaloneComponent)) {
    return;
  }
  const environmentInjector = context.injector.get(EnvironmentInjector, null, {
    optional: true
  });
  if (environmentInjector === null) {
    return;
  }
  const {
    standaloneInjectorToComponent
  } = frameworkDIDebugData;
  if (standaloneInjectorToComponent.has(environmentInjector)) {
    return;
  }
  standaloneInjectorToComponent.set(environmentInjector, standaloneComponent);
}
function isStandaloneComponent(value) {
  const def = getComponentDef(value);
  return !!def?.standalone;
}
function handleProviderConfiguredEvent(context, data) {
  const {
    resolverToProviders
  } = frameworkDIDebugData;
  let diResolver;
  if (context?.injector instanceof NodeInjector) {
    diResolver = getNodeInjectorTNode(context.injector);
  } else {
    diResolver = context.injector;
  }
  if (diResolver === null) {
    throwError("A ProviderConfigured event must be run within an injection context.");
  }
  if (!resolverToProviders.has(diResolver)) {
    resolverToProviders.set(diResolver, []);
  }
  resolverToProviders.get(diResolver).push(data);
}
function getDIResolver(injector) {
  let diResolver = null;
  if (injector === void 0) {
    return diResolver;
  }
  if (injector instanceof NodeInjector) {
    diResolver = getNodeInjectorLView(injector);
  } else {
    diResolver = injector;
  }
  return diResolver;
}
function canBeHeldWeakly(value) {
  return value !== null && (typeof value === "object" || typeof value === "function" || typeof value === "symbol");
}
function isSignal(value) {
  return typeof value === "function" && value[SIGNAL] !== void 0;
}
function isWritableSignal(value) {
  return isSignal(value) && typeof value.set === "function";
}
function applyChanges(component) {
  ngDevMode && assertDefined(component, "component");
  markViewDirty(getComponentViewByInstance(component), 3);
  getRootComponents(component).forEach((rootComponent) => detectChanges(rootComponent));
}
function detectChanges(component) {
  const view = getComponentViewByInstance(component);
  view[FLAGS] |= 1024;
  detectChangesInternal(view);
}
function getDeferBlocks$1(lView, deferBlocks) {
  const tView = lView[TVIEW];
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    if (isLContainer(lView[i])) {
      const lContainer = lView[i];
      const isLast = i === tView.bindingStartIndex - 1;
      if (!isLast) {
        const tNode = tView.data[i];
        const tDetails = getTDeferBlockDetails(tView, tNode);
        if (isTDeferBlockDetails(tDetails)) {
          deferBlocks.push({
            lContainer,
            lView,
            tNode,
            tDetails
          });
          continue;
        }
      }
      if (isLView(lContainer[HOST])) {
        getDeferBlocks$1(lContainer[HOST], deferBlocks);
      }
      for (let j = CONTAINER_HEADER_OFFSET; j < lContainer.length; j++) {
        getDeferBlocks$1(lContainer[j], deferBlocks);
      }
    } else if (isLView(lView[i])) {
      getDeferBlocks$1(lView[i], deferBlocks);
    }
  }
}
function getDeferBlocks(node) {
  const results = [];
  const lView = getLContext(node)?.lView;
  if (lView) {
    findDeferBlocks(node, lView, results);
  }
  return results;
}
function findDeferBlocks(node, lView, results) {
  const viewInjector = lView[INJECTOR];
  const registry = viewInjector.get(DEHYDRATED_BLOCK_REGISTRY, null, {
    optional: true
  });
  const blocks = [];
  getDeferBlocks$1(lView, blocks);
  const transferState = viewInjector.get(TransferState);
  const deferBlockParents = transferState.get(NGH_DEFER_BLOCKS_KEY, {});
  for (const details of blocks) {
    const native = getNativeByTNode(details.tNode, details.lView);
    const lDetails = getLDeferBlockDetails(details.lView, details.tNode);
    if (!node.contains(native)) {
      continue;
    }
    const tDetails = details.tDetails;
    const renderedLView = getRendererLView(details);
    const rootNodes = [];
    const hydrationState = inferHydrationState(tDetails, lDetails, registry);
    if (renderedLView !== null) {
      collectNativeNodes(renderedLView[TVIEW], renderedLView, renderedLView[TVIEW].firstChild, rootNodes);
    } else if (hydrationState === "dehydrated") {
      const deferId = lDetails[SSR_UNIQUE_ID];
      const deferData = deferBlockParents[deferId];
      const numberOfRootNodes = deferData[NUM_ROOT_NODES];
      let collectedNodeCount = 0;
      const deferBlockCommentNode = details.lContainer[NATIVE];
      let currentNode = deferBlockCommentNode.previousSibling;
      while (collectedNodeCount < numberOfRootNodes && currentNode) {
        rootNodes.unshift(currentNode);
        currentNode = currentNode.previousSibling;
        collectedNodeCount++;
      }
    }
    const data = {
      state: stringifyState(lDetails[DEFER_BLOCK_STATE]),
      incrementalHydrationState: hydrationState,
      hasErrorBlock: tDetails.errorTmplIndex !== null,
      loadingBlock: {
        exists: tDetails.loadingTmplIndex !== null,
        minimumTime: tDetails.loadingBlockConfig?.[MINIMUM_SLOT] ?? null,
        afterTime: tDetails.loadingBlockConfig?.[LOADING_AFTER_SLOT] ?? null
      },
      placeholderBlock: {
        exists: tDetails.placeholderTmplIndex !== null,
        minimumTime: tDetails.placeholderBlockConfig?.[MINIMUM_SLOT] ?? null
      },
      triggers: tDetails.debug?.triggers ? Array.from(tDetails.debug.triggers).sort() : [],
      rootNodes
    };
    results.push(data);
    if (renderedLView !== null) {
      findDeferBlocks(node, renderedLView, results);
    }
  }
}
function stringifyState(state) {
  switch (state) {
    case DeferBlockState.Complete:
      return "complete";
    case DeferBlockState.Loading:
      return "loading";
    case DeferBlockState.Placeholder:
      return "placeholder";
    case DeferBlockState.Error:
      return "error";
    case DeferBlockInternalState.Initial:
      return "initial";
    default:
      throw new Error(`Unrecognized state ${state}`);
  }
}
function inferHydrationState(tDetails, lDetails, registry) {
  if (registry === null || lDetails[SSR_UNIQUE_ID] === null || tDetails.hydrateTriggers === null || tDetails.hydrateTriggers.has(7)) {
    return "not-configured";
  }
  return registry.has(lDetails[SSR_UNIQUE_ID]) ? "dehydrated" : "hydrated";
}
function getRendererLView(details) {
  if (details.lContainer.length <= CONTAINER_HEADER_OFFSET) {
    return null;
  }
  const lView = details.lContainer[CONTAINER_HEADER_OFFSET];
  ngDevMode && assertLView(lView);
  return lView;
}
function getDependenciesFromInjectable(injector, token) {
  const instance = injector.get(token, null, {
    self: true,
    optional: true
  });
  if (instance === null) {
    throw new Error(`Unable to determine instance of ${token} in given injector`);
  }
  const unformattedDependencies = getDependenciesForTokenInInjector(token, injector);
  const resolutionPath = getInjectorResolutionPath(injector);
  const dependencies = unformattedDependencies.map((dep) => {
    const formattedDependency = {
      value: dep.value
    };
    const flags = dep.flags;
    formattedDependency.flags = {
      optional: (8 & flags) === 8,
      host: (1 & flags) === 1,
      self: (2 & flags) === 2,
      skipSelf: (4 & flags) === 4
    };
    for (let i = 0; i < resolutionPath.length; i++) {
      const injectorToCheck = resolutionPath[i];
      if (i === 0 && formattedDependency.flags.skipSelf) {
        continue;
      }
      if (formattedDependency.flags.host && injectorToCheck instanceof EnvironmentInjector) {
        break;
      }
      const instance2 = injectorToCheck.get(dep.token, null, {
        self: true,
        optional: true
      });
      if (instance2 !== null) {
        if (formattedDependency.flags.host) {
          const firstInjector = resolutionPath[0];
          const lookupFromFirstInjector = firstInjector.get(dep.token, null, __spreadProps(__spreadValues({}, formattedDependency.flags), {
            optional: true
          }));
          if (lookupFromFirstInjector !== null) {
            formattedDependency.providedIn = injectorToCheck;
          }
          break;
        }
        formattedDependency.providedIn = injectorToCheck;
        break;
      }
      if (i === 0 && formattedDependency.flags.self) {
        break;
      }
    }
    if (dep.token) formattedDependency.token = dep.token;
    return formattedDependency;
  });
  return {
    instance,
    dependencies
  };
}
function getDependenciesForTokenInInjector(token, injector) {
  const {
    resolverToTokenToDependencies
  } = getFrameworkDIDebugData();
  if (!(injector instanceof NodeInjector)) {
    return resolverToTokenToDependencies.get(injector)?.get?.(token) ?? [];
  }
  const lView = getNodeInjectorLView(injector);
  const tokenDependencyMap = resolverToTokenToDependencies.get(lView);
  const dependencies = tokenDependencyMap?.get(token) ?? [];
  return dependencies.filter((dependency) => {
    const dependencyNode = dependency.injectedIn?.tNode;
    if (dependencyNode === void 0) {
      return false;
    }
    const instanceNode = getNodeInjectorTNode(injector);
    assertTNode(dependencyNode);
    assertTNode(instanceNode);
    return dependencyNode === instanceNode;
  });
}
function getProviderImportsContainer(injector) {
  const {
    standaloneInjectorToComponent
  } = getFrameworkDIDebugData();
  if (standaloneInjectorToComponent.has(injector)) {
    return standaloneInjectorToComponent.get(injector);
  }
  const defTypeRef = injector.get(NgModuleRef$1, null, {
    self: true,
    optional: true
  });
  if (defTypeRef === null) {
    return null;
  }
  if (defTypeRef.instance === null) {
    return null;
  }
  return defTypeRef.instance.constructor;
}
function getNodeInjectorProviders(injector) {
  const diResolver = getNodeInjectorTNode(injector);
  const {
    resolverToProviders
  } = getFrameworkDIDebugData();
  return resolverToProviders.get(diResolver) ?? [];
}
function getProviderImportPaths(providerImportsContainer) {
  const providerToPath = /* @__PURE__ */ new Map();
  const visitedContainers = /* @__PURE__ */ new Set();
  const visitor = walkProviderTreeToDiscoverImportPaths(providerToPath, visitedContainers);
  walkProviderTree(providerImportsContainer, visitor, [], /* @__PURE__ */ new Set());
  return providerToPath;
}
function walkProviderTreeToDiscoverImportPaths(providerToPath, visitedContainers) {
  return (provider, container) => {
    if (!providerToPath.has(provider)) {
      providerToPath.set(provider, [container]);
    }
    if (!visitedContainers.has(container)) {
      for (const prov of providerToPath.keys()) {
        const existingImportPath = providerToPath.get(prov);
        let containerDef = getInjectorDef(container);
        if (!containerDef) {
          const ngModule = container.ngModule;
          containerDef = getInjectorDef(ngModule);
        }
        if (!containerDef) {
          return;
        }
        const lastContainerAddedToPath = existingImportPath[0];
        let isNextStepInPath = false;
        deepForEach(containerDef.imports, (moduleImport) => {
          if (isNextStepInPath) {
            return;
          }
          isNextStepInPath = moduleImport.ngModule === lastContainerAddedToPath || moduleImport === lastContainerAddedToPath;
          if (isNextStepInPath) {
            providerToPath.get(prov)?.unshift(container);
          }
        });
      }
    }
    visitedContainers.add(container);
  };
}
function getEnvironmentInjectorProviders(injector) {
  const providerRecordsWithoutImportPaths = getFrameworkDIDebugData().resolverToProviders.get(injector) ?? [];
  if (isPlatformInjector(injector)) {
    return providerRecordsWithoutImportPaths;
  }
  const providerImportsContainer = getProviderImportsContainer(injector);
  if (providerImportsContainer === null) {
    return providerRecordsWithoutImportPaths;
  }
  const providerToPath = getProviderImportPaths(providerImportsContainer);
  const providerRecords = [];
  for (const providerRecord of providerRecordsWithoutImportPaths) {
    const provider = providerRecord.provider;
    const token = provider.provide;
    if (token === ENVIRONMENT_INITIALIZER || token === INJECTOR_DEF_TYPES) {
      continue;
    }
    let importPath = providerToPath.get(provider) ?? [];
    const def = getComponentDef(providerImportsContainer);
    const isStandaloneComponent2 = !!def?.standalone;
    if (isStandaloneComponent2) {
      importPath = [providerImportsContainer, ...importPath];
    }
    providerRecords.push(__spreadProps(__spreadValues({}, providerRecord), {
      importPath
    }));
  }
  return providerRecords;
}
function isPlatformInjector(injector) {
  return injector instanceof R3Injector && injector.scopes.has("platform");
}
function getInjectorProviders(injector) {
  if (injector instanceof NodeInjector) {
    return getNodeInjectorProviders(injector);
  } else if (injector instanceof EnvironmentInjector) {
    return getEnvironmentInjectorProviders(injector);
  }
  throwError("getInjectorProviders only supports NodeInjector and EnvironmentInjector");
}
function getInjectorMetadata(injector) {
  if (injector instanceof NodeInjector) {
    const lView = getNodeInjectorLView(injector);
    const tNode = getNodeInjectorTNode(injector);
    assertTNodeForLView(tNode, lView);
    return {
      type: "element",
      source: getNativeByTNode(tNode, lView)
    };
  }
  if (injector instanceof R3Injector) {
    return {
      type: "environment",
      source: injector.source ?? null
    };
  }
  if (injector instanceof NullInjector) {
    return {
      type: "null",
      source: null
    };
  }
  return null;
}
function getInjectorResolutionPath(injector) {
  const resolutionPath = [injector];
  getInjectorResolutionPathHelper(injector, resolutionPath);
  return resolutionPath;
}
function getInjectorResolutionPathHelper(injector, resolutionPath) {
  const parent = getInjectorParent(injector);
  if (parent === null) {
    if (injector instanceof NodeInjector) {
      const firstInjector = resolutionPath[0];
      if (firstInjector instanceof NodeInjector) {
        const moduleInjector = getModuleInjectorOfNodeInjector(firstInjector);
        if (moduleInjector === null) {
          throwError("NodeInjector must have some connection to the module injector tree");
        }
        resolutionPath.push(moduleInjector);
        getInjectorResolutionPathHelper(moduleInjector, resolutionPath);
      }
      return resolutionPath;
    }
  } else {
    resolutionPath.push(parent);
    getInjectorResolutionPathHelper(parent, resolutionPath);
  }
  return resolutionPath;
}
function getInjectorParent(injector) {
  if (injector instanceof R3Injector) {
    return injector.parent;
  }
  let tNode;
  let lView;
  if (injector instanceof NodeInjector) {
    tNode = getNodeInjectorTNode(injector);
    lView = getNodeInjectorLView(injector);
  } else if (injector instanceof NullInjector) {
    return null;
  } else if (injector instanceof ChainedInjector) {
    return injector.parentInjector;
  } else {
    throwError("getInjectorParent only support injectors of type R3Injector, NodeInjector, NullInjector");
  }
  const parentLocation = getParentInjectorLocation(tNode, lView);
  if (hasParentInjector(parentLocation)) {
    const parentInjectorIndex = getParentInjectorIndex(parentLocation);
    const parentLView = getParentInjectorView(parentLocation, lView);
    const parentTView = parentLView[TVIEW];
    const parentTNode = parentTView.data[parentInjectorIndex + 8];
    return new NodeInjector(parentTNode, parentLView);
  } else {
    const chainedInjector = lView[INJECTOR];
    const injectorParent = chainedInjector.injector?.parent;
    if (injectorParent instanceof NodeInjector) {
      return injectorParent;
    }
  }
  return null;
}
function getModuleInjectorOfNodeInjector(injector) {
  let lView;
  if (injector instanceof NodeInjector) {
    lView = getNodeInjectorLView(injector);
  } else {
    throwError("getModuleInjectorOfNodeInjector must be called with a NodeInjector");
  }
  const inj = lView[INJECTOR];
  const moduleInjector = inj instanceof ChainedInjector ? inj.parentInjector : inj.parent;
  if (!moduleInjector) {
    throwError("NodeInjector must have some connection to the module injector tree");
  }
  return moduleInjector;
}
function isComputedNode(node) {
  return node.kind === "computed";
}
function isTemplateEffectNode(node) {
  return node.kind === "template";
}
function isSignalNode(node) {
  return node.kind === "signal";
}
function getTemplateConsumer(injector) {
  const tNode = getNodeInjectorTNode(injector);
  assertTNode(tNode);
  const lView = getNodeInjectorLView(injector);
  assertLView(lView);
  const templateLView = lView[tNode.index];
  if (isLView(templateLView)) {
    return templateLView[REACTIVE_TEMPLATE_CONSUMER] ?? null;
  }
  return null;
}
var signalDebugMap = /* @__PURE__ */ new WeakMap();
var counter$1 = 0;
function getNodesAndEdgesFromSignalMap(signalMap) {
  const nodes = Array.from(signalMap.keys());
  const debugSignalGraphNodes = [];
  const edges = [];
  for (const [consumer, producers] of signalMap.entries()) {
    const consumerIndex = nodes.indexOf(consumer);
    let id = signalDebugMap.get(consumer);
    if (!id) {
      counter$1++;
      id = counter$1.toString();
      signalDebugMap.set(consumer, id);
    }
    if (isComputedNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        value: consumer.value,
        kind: consumer.kind,
        epoch: consumer.version,
        debuggableFn: consumer.computation,
        id
      });
    } else if (isSignalNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        value: consumer.value,
        kind: consumer.kind,
        epoch: consumer.version,
        id
      });
    } else if (isTemplateEffectNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName ?? consumer.lView?.[HOST]?.tagName?.toLowerCase?.(),
        kind: consumer.kind,
        epoch: consumer.version,
        debuggableFn: consumer.lView?.[CONTEXT]?.constructor,
        id
      });
    } else {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        kind: consumer.kind,
        epoch: consumer.version,
        id
      });
    }
    for (const producer of producers) {
      edges.push({
        consumer: consumerIndex,
        producer: nodes.indexOf(producer)
      });
    }
  }
  return {
    nodes: debugSignalGraphNodes,
    edges
  };
}
function extractEffectsFromInjector(injector) {
  let diResolver = injector;
  if (injector instanceof NodeInjector) {
    const lView = getNodeInjectorLView(injector);
    diResolver = lView;
  }
  const resolverToEffects = getFrameworkDIDebugData().resolverToEffects;
  const effects = resolverToEffects.get(diResolver) ?? [];
  return effects.map((effect2) => {
    if (effect2 instanceof EffectRefImpl) {
      return effect2[SIGNAL];
    } else {
      return effect2.signal[SIGNAL];
    }
  });
}
function extractSignalNodesAndEdgesFromRoots(nodes, signalDependenciesMap = /* @__PURE__ */ new Map()) {
  for (const node of nodes) {
    if (signalDependenciesMap.has(node)) {
      continue;
    }
    const producerNodes = [];
    for (let link = node.producers; link !== void 0; link = link.nextProducer) {
      const producer = link.producer;
      producerNodes.push(producer);
    }
    signalDependenciesMap.set(node, producerNodes);
    extractSignalNodesAndEdgesFromRoots(producerNodes, signalDependenciesMap);
  }
  return signalDependenciesMap;
}
function getSignalGraph(injector) {
  let templateConsumer = null;
  if (!(injector instanceof NodeInjector) && !(injector instanceof R3Injector)) {
    return throwError("getSignalGraph must be called with a NodeInjector or R3Injector");
  }
  if (injector instanceof NodeInjector) {
    templateConsumer = getTemplateConsumer(injector);
  }
  const nonTemplateEffectNodes = extractEffectsFromInjector(injector);
  const signalNodes = templateConsumer ? [templateConsumer, ...nonTemplateEffectNodes] : nonTemplateEffectNodes;
  const signalDependenciesMap = extractSignalNodesAndEdgesFromRoots(signalNodes);
  return getNodesAndEdgesFromSignalMap(signalDependenciesMap);
}
var changeDetectionRuns = 0;
var changeDetectionSyncRuns = 0;
var counter = 0;
var eventsStack = [];
function measureStart(startEvent) {
  eventsStack.push([startEvent, counter]);
  console.timeStamp("Event_" + startEvent + "_" + counter++);
}
function measureEnd(startEvent, entryName, color) {
  let top;
  do {
    top = eventsStack.pop();
    assertDefined(top, "Profiling error: could not find start event entry " + startEvent);
  } while (top[0] !== startEvent);
  console.timeStamp(entryName, "Event_" + top[0] + "_" + top[1], void 0, "🅰️ Angular", void 0, color);
}
var chromeDevToolsInjectorProfiler = (event) => {
  const eventType = event.type;
  if (eventType === 5) {
    measureStart(100);
  } else if (eventType === 1) {
    const token = event.context.token;
    measureEnd(100, getProviderTokenMeasureName(token), "tertiary-dark");
  }
};
var devToolsProfiler = (event, instance, eventFn) => {
  switch (event) {
    case ProfilerEvent.BootstrapApplicationStart:
    case ProfilerEvent.BootstrapComponentStart:
    case ProfilerEvent.ChangeDetectionStart:
    case ProfilerEvent.ChangeDetectionSyncStart:
    case ProfilerEvent.AfterRenderHooksStart:
    case ProfilerEvent.ComponentStart:
    case ProfilerEvent.DeferBlockStateStart:
    case ProfilerEvent.DynamicComponentStart:
    case ProfilerEvent.TemplateCreateStart:
    case ProfilerEvent.LifecycleHookStart:
    case ProfilerEvent.TemplateUpdateStart:
    case ProfilerEvent.HostBindingsUpdateStart:
    case ProfilerEvent.OutputStart: {
      measureStart(event);
      break;
    }
    case ProfilerEvent.BootstrapApplicationEnd: {
      measureEnd(ProfilerEvent.BootstrapApplicationStart, "Bootstrap application", "primary-dark");
      break;
    }
    case ProfilerEvent.BootstrapComponentEnd: {
      measureEnd(ProfilerEvent.BootstrapComponentStart, "Bootstrap component", "primary-dark");
      break;
    }
    case ProfilerEvent.ChangeDetectionEnd: {
      changeDetectionSyncRuns = 0;
      measureEnd(ProfilerEvent.ChangeDetectionStart, "Change detection " + changeDetectionRuns++, "primary-dark");
      break;
    }
    case ProfilerEvent.ChangeDetectionSyncEnd: {
      measureEnd(ProfilerEvent.ChangeDetectionSyncStart, "Synchronization " + changeDetectionSyncRuns++, "primary");
      break;
    }
    case ProfilerEvent.AfterRenderHooksEnd: {
      measureEnd(ProfilerEvent.AfterRenderHooksStart, "After render hooks", "primary");
      break;
    }
    case ProfilerEvent.ComponentEnd: {
      const typeName = getComponentMeasureName(instance);
      measureEnd(ProfilerEvent.ComponentStart, typeName, "primary-light");
      break;
    }
    case ProfilerEvent.DeferBlockStateEnd: {
      measureEnd(ProfilerEvent.DeferBlockStateStart, "Defer block", "primary-dark");
      break;
    }
    case ProfilerEvent.DynamicComponentEnd: {
      measureEnd(ProfilerEvent.DynamicComponentStart, "Dynamic component creation", "primary-dark");
      break;
    }
    case ProfilerEvent.TemplateUpdateEnd: {
      measureEnd(ProfilerEvent.TemplateUpdateStart, stringifyForError(eventFn) + " (update)", "secondary-dark");
      break;
    }
    case ProfilerEvent.TemplateCreateEnd: {
      measureEnd(ProfilerEvent.TemplateCreateStart, stringifyForError(eventFn) + " (create)", "secondary");
      break;
    }
    case ProfilerEvent.HostBindingsUpdateEnd: {
      measureEnd(ProfilerEvent.HostBindingsUpdateStart, "HostBindings", "secondary-dark");
      break;
    }
    case ProfilerEvent.LifecycleHookEnd: {
      const typeName = getComponentMeasureName(instance);
      measureEnd(ProfilerEvent.LifecycleHookStart, `${typeName}:${stringifyForError(eventFn)}`, "tertiary");
      break;
    }
    case ProfilerEvent.OutputEnd: {
      measureEnd(ProfilerEvent.OutputStart, stringifyForError(eventFn), "tertiary-light");
      break;
    }
    default: {
      throw new Error("Unexpected profiling event type: " + event);
    }
  }
};
function getComponentMeasureName(instance) {
  return instance.constructor.name;
}
function getProviderTokenMeasureName(token) {
  if (isTypeProvider(token)) {
    return token.name;
  } else if (token.provide != null) {
    return getProviderTokenMeasureName(token.provide);
  }
  return token.toString();
}
function enableProfiling() {
  performanceMarkFeature("Chrome DevTools profiling");
  if (typeof ngDevMode !== "undefined" && ngDevMode) {
    const removeInjectorProfiler = setInjectorProfiler(chromeDevToolsInjectorProfiler);
    const removeProfiler2 = setProfiler(devToolsProfiler);
    return () => {
      removeInjectorProfiler();
      removeProfiler2();
    };
  }
  return () => {
  };
}
function getTransferState(injector) {
  const doc = injector.get(DOCUMENT);
  const appId = injector.get(APP_ID);
  const transferState = retrieveTransferredState(doc, appId);
  const filteredEntries = {};
  for (const [key, value] of Object.entries(transferState)) {
    if (!isInternalHydrationTransferStateKey(key)) {
      filteredEntries[key] = value;
    }
  }
  return filteredEntries;
}
var GLOBAL_PUBLISH_EXPANDO_KEY = "ng";
var globalUtilsFunctions = {
  "ɵgetDependenciesFromInjectable": getDependenciesFromInjectable,
  "ɵgetInjectorProviders": getInjectorProviders,
  "ɵgetInjectorResolutionPath": getInjectorResolutionPath,
  "ɵgetInjectorMetadata": getInjectorMetadata,
  "ɵsetProfiler": setProfiler,
  "ɵgetSignalGraph": getSignalGraph,
  "ɵgetDeferBlocks": getDeferBlocks,
  "ɵgetTransferState": getTransferState,
  "getDirectiveMetadata": getDirectiveMetadata$1,
  "getComponent": getComponent,
  "getContext": getContext,
  "getListeners": getListeners,
  "getOwningComponent": getOwningComponent,
  "getHostElement": getHostElement,
  "getInjector": getInjector,
  "getRootComponents": getRootComponents,
  "getDirectives": getDirectives,
  "applyChanges": applyChanges,
  "isSignal": isSignal,
  "enableProfiling": enableProfiling
};
var _published = false;
function publishDefaultGlobalUtils$1() {
  if (!_published) {
    _published = true;
    if (typeof window !== "undefined") {
      setupFrameworkInjectorProfiler();
    }
    for (const [methodName, method] of Object.entries(globalUtilsFunctions)) {
      publishGlobalUtil(methodName, method);
    }
  }
}
function publishGlobalUtil(name, fn) {
  publishUtil(name, fn);
}
function publishExternalGlobalUtil(name, fn) {
  publishUtil(name, fn);
}
function publishUtil(name, fn) {
  if (typeof COMPILED === "undefined" || !COMPILED) {
    const w = _global;
    ngDevMode && assertDefined(fn, "function not defined");
    w[GLOBAL_PUBLISH_EXPANDO_KEY] ??= {};
    w[GLOBAL_PUBLISH_EXPANDO_KEY][name] = fn;
  }
}
var TESTABILITY = new InjectionToken("");
var TESTABILITY_GETTER = new InjectionToken("");
var Testability = class _Testability {
  _ngZone;
  registry;
  _isZoneStable = true;
  _callbacks = [];
  _taskTrackingZone = null;
  _destroyRef;
  constructor(_ngZone, registry, testabilityGetter) {
    this._ngZone = _ngZone;
    this.registry = registry;
    if (isInInjectionContext()) {
      this._destroyRef = inject(DestroyRef, {
        optional: true
      }) ?? void 0;
    }
    if (!_testabilityGetter) {
      setTestabilityGetter(testabilityGetter);
      testabilityGetter.addToWindow(registry);
    }
    this._watchAngularEvents();
    _ngZone.run(() => {
      this._taskTrackingZone = typeof Zone == "undefined" ? null : Zone.current.get("TaskTrackingZone");
    });
  }
  _watchAngularEvents() {
    const onUnstableSubscription = this._ngZone.onUnstable.subscribe({
      next: () => {
        this._isZoneStable = false;
      }
    });
    const onStableSubscription = this._ngZone.runOutsideAngular(() => this._ngZone.onStable.subscribe({
      next: () => {
        NgZone.assertNotInAngularZone();
        queueMicrotask(() => {
          this._isZoneStable = true;
          this._runCallbacksIfReady();
        });
      }
    }));
    this._destroyRef?.onDestroy(() => {
      onUnstableSubscription.unsubscribe();
      onStableSubscription.unsubscribe();
    });
  }
  isStable() {
    return this._isZoneStable && !this._ngZone.hasPendingMacrotasks;
  }
  _runCallbacksIfReady() {
    if (this.isStable()) {
      queueMicrotask(() => {
        while (this._callbacks.length !== 0) {
          let cb = this._callbacks.pop();
          clearTimeout(cb.timeoutId);
          cb.doneCb();
        }
      });
    } else {
      let pending = this.getPendingTasks();
      this._callbacks = this._callbacks.filter((cb) => {
        if (cb.updateCb && cb.updateCb(pending)) {
          clearTimeout(cb.timeoutId);
          return false;
        }
        return true;
      });
    }
  }
  getPendingTasks() {
    if (!this._taskTrackingZone) {
      return [];
    }
    return this._taskTrackingZone.macroTasks.map((t) => {
      return {
        source: t.source,
        creationLocation: t.creationLocation,
        data: t.data
      };
    });
  }
  addCallback(cb, timeout, updateCb) {
    let timeoutId = -1;
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => {
        this._callbacks = this._callbacks.filter((cb2) => cb2.timeoutId !== timeoutId);
        cb();
      }, timeout);
    }
    this._callbacks.push({
      doneCb: cb,
      timeoutId,
      updateCb
    });
  }
  whenStable(doneCb, timeout, updateCb) {
    if (updateCb && !this._taskTrackingZone) {
      throw new Error('Task tracking zone is required when passing an update callback to whenStable(). Is "zone.js/plugins/task-tracking" loaded?');
    }
    this.addCallback(doneCb, timeout, updateCb);
    this._runCallbacksIfReady();
  }
  registerApplication(token) {
    this.registry.registerApplication(token, this);
  }
  unregisterApplication(token) {
    this.registry.unregisterApplication(token);
  }
  findProviders(using, provider, exactMatch) {
    return [];
  }
  static ɵfac = function Testability_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Testability)(ɵɵinject(NgZone), ɵɵinject(TestabilityRegistry), ɵɵinject(TESTABILITY_GETTER));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _Testability,
    factory: _Testability.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Testability, [{
    type: Injectable
  }], () => [{
    type: NgZone
  }, {
    type: TestabilityRegistry
  }, {
    type: void 0,
    decorators: [{
      type: Inject,
      args: [TESTABILITY_GETTER]
    }]
  }], null);
})();
var TestabilityRegistry = class _TestabilityRegistry {
  _applications = /* @__PURE__ */ new Map();
  registerApplication(token, testability) {
    this._applications.set(token, testability);
  }
  unregisterApplication(token) {
    this._applications.delete(token);
  }
  unregisterAllApplications() {
    this._applications.clear();
  }
  getTestability(elem) {
    return this._applications.get(elem) || null;
  }
  getAllTestabilities() {
    return Array.from(this._applications.values());
  }
  getAllRootElements() {
    return Array.from(this._applications.keys());
  }
  findTestabilityInTree(elem, findInAncestors = true) {
    return _testabilityGetter?.findTestabilityInTree(this, elem, findInAncestors) ?? null;
  }
  static ɵfac = function TestabilityRegistry_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TestabilityRegistry)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _TestabilityRegistry,
    factory: _TestabilityRegistry.ɵfac,
    providedIn: "platform"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TestabilityRegistry, [{
    type: Injectable,
    args: [{
      providedIn: "platform"
    }]
  }], null, null);
})();
function setTestabilityGetter(getter) {
  _testabilityGetter = getter;
}
var _testabilityGetter;
function isPromise(obj) {
  return !!obj && typeof obj.then === "function";
}
function isSubscribable(obj) {
  return !!obj && typeof obj.subscribe === "function";
}
var APP_INITIALIZER = new InjectionToken(ngDevMode ? "Application Initializer" : "");
function provideAppInitializer(initializerFn) {
  return makeEnvironmentProviders([{
    provide: APP_INITIALIZER,
    multi: true,
    useValue: initializerFn
  }]);
}
var ApplicationInitStatus = class _ApplicationInitStatus {
  resolve;
  reject;
  initialized = false;
  done = false;
  donePromise = new Promise((res, rej) => {
    this.resolve = res;
    this.reject = rej;
  });
  appInits = inject(APP_INITIALIZER, {
    optional: true
  }) ?? [];
  injector = inject(Injector);
  constructor() {
    if ((typeof ngDevMode === "undefined" || ngDevMode) && !Array.isArray(this.appInits)) {
      throw new RuntimeError(-209, `Unexpected type of the \`APP_INITIALIZER\` token value (expected an array, but got ${typeof this.appInits}). Please check that the \`APP_INITIALIZER\` token is configured as a \`multi: true\` provider.`);
    }
  }
  runInitializers() {
    if (this.initialized) {
      return;
    }
    const asyncInitPromises = [];
    for (const appInits of this.appInits) {
      const initResult = runInInjectionContext(this.injector, appInits);
      if (isPromise(initResult)) {
        asyncInitPromises.push(initResult);
      } else if (isSubscribable(initResult)) {
        const observableAsPromise = new Promise((resolve, reject) => {
          initResult.subscribe({
            complete: resolve,
            error: reject
          });
        });
        asyncInitPromises.push(observableAsPromise);
      }
    }
    const complete = () => {
      this.done = true;
      this.resolve();
    };
    Promise.all(asyncInitPromises).then(() => {
      complete();
    }).catch((e) => {
      this.reject(e);
    });
    if (asyncInitPromises.length === 0) {
      complete();
    }
    this.initialized = true;
  }
  static ɵfac = function ApplicationInitStatus_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ApplicationInitStatus)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ApplicationInitStatus,
    factory: _ApplicationInitStatus.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ApplicationInitStatus, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
var APP_BOOTSTRAP_LISTENER = new InjectionToken(ngDevMode ? "appBootstrapListener" : "");
function publishDefaultGlobalUtils() {
  ngDevMode && publishDefaultGlobalUtils$1();
}
function publishSignalConfiguration() {
  setThrowInvalidWriteToSignalError(() => {
    let errorMessage = "";
    if (ngDevMode) {
      const activeConsumer = getActiveConsumer();
      errorMessage = activeConsumer && isReactiveLViewConsumer(activeConsumer) ? "Writing to signals is not allowed while Angular renders the template (eg. interpolations)" : "Writing to signals is not allowed in a `computed`";
    }
    throw new RuntimeError(600, errorMessage);
  });
}
function isBoundToModule(cf) {
  return cf.isBoundToModule;
}
var MAXIMUM_REFRESH_RERUNS = 10;
function optionsReducer(dst, objs) {
  if (Array.isArray(objs)) {
    return objs.reduce(optionsReducer, dst);
  }
  return __spreadValues(__spreadValues({}, dst), objs);
}
var ApplicationRef = class _ApplicationRef {
  _runningTick = false;
  _destroyed = false;
  _destroyListeners = [];
  _views = [];
  internalErrorHandler = inject(INTERNAL_APPLICATION_ERROR_HANDLER);
  afterRenderManager = inject(AfterRenderManager);
  zonelessEnabled = inject(ZONELESS_ENABLED);
  rootEffectScheduler = inject(EffectScheduler);
  dirtyFlags = 0;
  tracingSnapshot = null;
  allTestViews = /* @__PURE__ */ new Set();
  autoDetectTestViews = /* @__PURE__ */ new Set();
  includeAllTestViews = false;
  afterTick = new Subject();
  get allViews() {
    return [...(this.includeAllTestViews ? this.allTestViews : this.autoDetectTestViews).keys(), ...this._views];
  }
  get destroyed() {
    return this._destroyed;
  }
  componentTypes = [];
  components = [];
  internalPendingTask = inject(PendingTasksInternal);
  get isStable() {
    return this.internalPendingTask.hasPendingTasksObservable.pipe(map((pending) => !pending));
  }
  constructor() {
    inject(TracingService, {
      optional: true
    });
  }
  whenStable() {
    let subscription;
    return new Promise((resolve) => {
      subscription = this.isStable.subscribe({
        next: (stable) => {
          if (stable) {
            resolve();
          }
        }
      });
    }).finally(() => {
      subscription.unsubscribe();
    });
  }
  _injector = inject(EnvironmentInjector);
  _rendererFactory = null;
  get injector() {
    return this._injector;
  }
  bootstrap(componentOrFactory, rootSelectorOrNode) {
    return this.bootstrapImpl(componentOrFactory, rootSelectorOrNode);
  }
  bootstrapImpl(componentOrFactory, rootSelectorOrNode, injector = Injector.NULL) {
    const ngZone = this._injector.get(NgZone);
    return ngZone.run(() => {
      profiler(ProfilerEvent.BootstrapComponentStart);
      (typeof ngDevMode === "undefined" || ngDevMode) && warnIfDestroyed(this._destroyed);
      const isComponentFactory = componentOrFactory instanceof ComponentFactory$1;
      const initStatus = this._injector.get(ApplicationInitStatus);
      if (!initStatus.done) {
        let errorMessage = "";
        if (typeof ngDevMode === "undefined" || ngDevMode) {
          const standalone = !isComponentFactory && isStandalone(componentOrFactory);
          errorMessage = "Cannot bootstrap as there are still asynchronous initializers running." + (standalone ? "" : " Bootstrap components in the `ngDoBootstrap` method of the root module.");
        }
        throw new RuntimeError(405, errorMessage);
      }
      let componentFactory;
      if (isComponentFactory) {
        componentFactory = componentOrFactory;
      } else {
        const resolver = this._injector.get(ComponentFactoryResolver$1);
        componentFactory = resolver.resolveComponentFactory(componentOrFactory);
      }
      this.componentTypes.push(componentFactory.componentType);
      const ngModule = isBoundToModule(componentFactory) ? void 0 : this._injector.get(NgModuleRef$1);
      const selectorOrNode = rootSelectorOrNode || componentFactory.selector;
      const compRef = componentFactory.create(injector, [], selectorOrNode, ngModule);
      const nativeElement = compRef.location.nativeElement;
      const testability = compRef.injector.get(TESTABILITY, null);
      testability?.registerApplication(nativeElement);
      compRef.onDestroy(() => {
        this.detachView(compRef.hostView);
        remove(this.components, compRef);
        testability?.unregisterApplication(nativeElement);
      });
      this._loadComponent(compRef);
      if (typeof ngDevMode === "undefined" || ngDevMode) {
        const _console = this._injector.get(Console);
        _console.log(`Angular is running in development mode.`);
      }
      profiler(ProfilerEvent.BootstrapComponentEnd, compRef);
      return compRef;
    });
  }
  tick() {
    if (!this.zonelessEnabled) {
      this.dirtyFlags |= 1;
    }
    this._tick();
  }
  _tick() {
    profiler(ProfilerEvent.ChangeDetectionStart);
    if (this.tracingSnapshot !== null) {
      this.tracingSnapshot.run(TracingAction.CHANGE_DETECTION, this.tickImpl);
    } else {
      this.tickImpl();
    }
  }
  tickImpl = () => {
    (typeof ngDevMode === "undefined" || ngDevMode) && warnIfDestroyed(this._destroyed);
    if (this._runningTick) {
      profiler(ProfilerEvent.ChangeDetectionEnd);
      throw new RuntimeError(101, ngDevMode && "ApplicationRef.tick is called recursively");
    }
    const prevConsumer = setActiveConsumer(null);
    try {
      this._runningTick = true;
      this.synchronize();
      if (typeof ngDevMode === "undefined" || ngDevMode) {
        for (let view of this.allViews) {
          view.checkNoChanges();
        }
      }
    } finally {
      this._runningTick = false;
      this.tracingSnapshot?.dispose();
      this.tracingSnapshot = null;
      setActiveConsumer(prevConsumer);
      this.afterTick.next();
      profiler(ProfilerEvent.ChangeDetectionEnd);
    }
  };
  synchronize() {
    if (this._rendererFactory === null && !this._injector.destroyed) {
      this._rendererFactory = this._injector.get(RendererFactory2, null, {
        optional: true
      });
    }
    let runs = 0;
    while (this.dirtyFlags !== 0 && runs++ < MAXIMUM_REFRESH_RERUNS) {
      profiler(ProfilerEvent.ChangeDetectionSyncStart);
      try {
        this.synchronizeOnce();
      } finally {
        profiler(ProfilerEvent.ChangeDetectionSyncEnd);
      }
    }
    if ((typeof ngDevMode === "undefined" || ngDevMode) && runs >= MAXIMUM_REFRESH_RERUNS) {
      throw new RuntimeError(103, ngDevMode && "Infinite change detection while refreshing application views. Ensure views are not calling `markForCheck` on every template execution or that afterRender hooks always mark views for check.");
    }
  }
  synchronizeOnce() {
    if (this.dirtyFlags & 16) {
      this.dirtyFlags &= ~16;
      this.rootEffectScheduler.flush();
    }
    let ranDetectChanges = false;
    if (this.dirtyFlags & 7) {
      const useGlobalCheck = Boolean(this.dirtyFlags & 1);
      this.dirtyFlags &= ~7;
      this.dirtyFlags |= 8;
      for (let {
        _lView
      } of this.allViews) {
        if (!useGlobalCheck && !requiresRefreshOrTraversal(_lView)) {
          continue;
        }
        const mode = useGlobalCheck && !this.zonelessEnabled ? 0 : 1;
        detectChangesInternal(_lView, mode);
        ranDetectChanges = true;
      }
      this.dirtyFlags &= ~4;
      this.syncDirtyFlagsWithViews();
      if (this.dirtyFlags & (7 | 16)) {
        return;
      }
    }
    if (!ranDetectChanges) {
      this._rendererFactory?.begin?.();
      this._rendererFactory?.end?.();
    }
    if (this.dirtyFlags & 8) {
      this.dirtyFlags &= ~8;
      this.afterRenderManager.execute();
    }
    this.syncDirtyFlagsWithViews();
  }
  syncDirtyFlagsWithViews() {
    if (this.allViews.some(({
      _lView
    }) => requiresRefreshOrTraversal(_lView))) {
      this.dirtyFlags |= 2;
      return;
    } else {
      this.dirtyFlags &= ~7;
    }
  }
  attachView(viewRef) {
    (typeof ngDevMode === "undefined" || ngDevMode) && warnIfDestroyed(this._destroyed);
    const view = viewRef;
    this._views.push(view);
    view.attachToAppRef(this);
  }
  detachView(viewRef) {
    (typeof ngDevMode === "undefined" || ngDevMode) && warnIfDestroyed(this._destroyed);
    const view = viewRef;
    remove(this._views, view);
    view.detachFromAppRef();
  }
  _loadComponent(componentRef) {
    this.attachView(componentRef.hostView);
    try {
      this.tick();
    } catch (e) {
      this.internalErrorHandler(e);
    }
    this.components.push(componentRef);
    const listeners = this._injector.get(APP_BOOTSTRAP_LISTENER, []);
    if (ngDevMode && !Array.isArray(listeners)) {
      throw new RuntimeError(-209, `Unexpected type of the \`APP_BOOTSTRAP_LISTENER\` token value (expected an array, but got ${typeof listeners}). Please check that the \`APP_BOOTSTRAP_LISTENER\` token is configured as a \`multi: true\` provider.`);
    }
    listeners.forEach((listener) => listener(componentRef));
  }
  ngOnDestroy() {
    if (this._destroyed) return;
    try {
      this._destroyListeners.forEach((listener) => listener());
      this._views.slice().forEach((view) => view.destroy());
    } finally {
      this._destroyed = true;
      this._views = [];
      this._destroyListeners = [];
    }
  }
  onDestroy(callback) {
    (typeof ngDevMode === "undefined" || ngDevMode) && warnIfDestroyed(this._destroyed);
    this._destroyListeners.push(callback);
    return () => remove(this._destroyListeners, callback);
  }
  destroy() {
    if (this._destroyed) {
      throw new RuntimeError(406, ngDevMode && "This instance of the `ApplicationRef` has already been destroyed.");
    }
    const injector = this._injector;
    if (injector.destroy && !injector.destroyed) {
      injector.destroy();
    }
  }
  get viewCount() {
    return this._views.length;
  }
  static ɵfac = function ApplicationRef_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ApplicationRef)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ApplicationRef,
    factory: _ApplicationRef.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ApplicationRef, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
function warnIfDestroyed(destroyed) {
  if (destroyed) {
    console.warn(formatRuntimeError(406, "This instance of the `ApplicationRef` has already been destroyed."));
  }
}
function remove(list, el) {
  const index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
  }
}
function promiseWithResolvers() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve,
    reject
  };
}
function scheduleDelayedTrigger(scheduleFn) {
  const lView = getLView();
  const tNode = getCurrentTNode();
  renderPlaceholder(lView, tNode);
  if (!shouldTriggerDeferBlock(0, lView)) return;
  const injector = lView[INJECTOR];
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const cleanupFn = scheduleFn(() => triggerDeferBlock(0, lView, tNode), injector);
  storeTriggerCleanupFn(0, lDetails, cleanupFn);
}
function scheduleDelayedPrefetching(scheduleFn) {
  if (false) return;
  const lView = getLView();
  const injector = lView[INJECTOR];
  const tNode = getCurrentTNode();
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);
  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    const lDetails = getLDeferBlockDetails(lView, tNode);
    const prefetch = () => triggerPrefetching(tDetails, lView, tNode);
    const cleanupFn = scheduleFn(prefetch, injector);
    storeTriggerCleanupFn(1, lDetails, cleanupFn);
  }
}
function scheduleDelayedHydrating(scheduleFn, lView, tNode) {
  if (false) return;
  const injector = lView[INJECTOR];
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const ssrUniqueId = lDetails[SSR_UNIQUE_ID];
  ngDevMode && assertSsrIdDefined(ssrUniqueId);
  const cleanupFn = scheduleFn(() => triggerHydrationFromBlockName(injector, ssrUniqueId), injector);
  storeTriggerCleanupFn(2, lDetails, cleanupFn);
}
function triggerPrefetching(tDetails, lView, tNode) {
  triggerResourceLoading(tDetails, lView, tNode);
}
function triggerResourceLoading(tDetails, lView, tNode) {
  const injector = lView[INJECTOR];
  const tView = lView[TVIEW];
  if (tDetails.loadingState !== DeferDependenciesLoadingState.NOT_STARTED) {
    return tDetails.loadingPromise ?? Promise.resolve();
  }
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const primaryBlockTNode = getPrimaryBlockTNode(tView, tDetails);
  tDetails.loadingState = DeferDependenciesLoadingState.IN_PROGRESS;
  invokeTriggerCleanupFns(1, lDetails);
  let dependenciesFn = tDetails.dependencyResolverFn;
  if (ngDevMode) {
    const deferDependencyInterceptor = injector.get(DEFER_BLOCK_DEPENDENCY_INTERCEPTOR, null, {
      optional: true
    });
    if (deferDependencyInterceptor) {
      dependenciesFn = deferDependencyInterceptor.intercept(dependenciesFn);
    }
  }
  const removeTask = injector.get(PendingTasks).add();
  if (!dependenciesFn) {
    tDetails.loadingPromise = Promise.resolve().then(() => {
      tDetails.loadingPromise = null;
      tDetails.loadingState = DeferDependenciesLoadingState.COMPLETE;
      removeTask();
    });
    return tDetails.loadingPromise;
  }
  tDetails.loadingPromise = Promise.allSettled(dependenciesFn()).then((results) => {
    let failed = false;
    const directiveDefs = [];
    const pipeDefs = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        const dependency = result.value;
        const directiveDef = getComponentDef(dependency) || getDirectiveDef(dependency);
        if (directiveDef) {
          directiveDefs.push(directiveDef);
        } else {
          const pipeDef = getPipeDef(dependency);
          if (pipeDef) {
            pipeDefs.push(pipeDef);
          }
        }
      } else {
        failed = true;
        break;
      }
    }
    if (failed) {
      tDetails.loadingState = DeferDependenciesLoadingState.FAILED;
      if (tDetails.errorTmplIndex === null) {
        const templateLocation = ngDevMode ? getTemplateLocationDetails(lView) : "";
        const error = new RuntimeError(-750, ngDevMode && `Loading dependencies for \`@defer\` block failed, but no \`@error\` block was configured${templateLocation}. Consider using the \`@error\` block to render an error state.`);
        handleUncaughtError(lView, error);
      }
    } else {
      tDetails.loadingState = DeferDependenciesLoadingState.COMPLETE;
      const primaryBlockTView = primaryBlockTNode.tView;
      if (directiveDefs.length > 0) {
        primaryBlockTView.directiveRegistry = addDepsToRegistry(primaryBlockTView.directiveRegistry, directiveDefs);
        const directiveTypes = directiveDefs.map((def) => def.type);
        const providers = internalImportProvidersFrom(false, ...directiveTypes);
        tDetails.providers = providers;
      }
      if (pipeDefs.length > 0) {
        primaryBlockTView.pipeRegistry = addDepsToRegistry(primaryBlockTView.pipeRegistry, pipeDefs);
      }
    }
  });
  return tDetails.loadingPromise.finally(() => {
    tDetails.loadingPromise = null;
    removeTask();
  });
}
function shouldTriggerDeferBlock(triggerType, lView) {
  if (triggerType === 0 && true && false) {
    return false;
  }
  const injector = lView[INJECTOR];
  const config = injector.get(DEFER_BLOCK_CONFIG, null, {
    optional: true
  });
  if (config?.behavior === DeferBlockBehavior.Manual) {
    return false;
  }
  return true;
}
function triggerDeferBlock(triggerType, lView, tNode) {
  const tView = lView[TVIEW];
  const lContainer = lView[tNode.index];
  ngDevMode && assertLContainer(lContainer);
  if (!shouldTriggerDeferBlock(triggerType, lView)) return;
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const tDetails = getTDeferBlockDetails(tView, tNode);
  invokeAllTriggerCleanupFns(lDetails);
  switch (tDetails.loadingState) {
    case DeferDependenciesLoadingState.NOT_STARTED:
      renderDeferBlockState(DeferBlockState.Loading, tNode, lContainer);
      triggerResourceLoading(tDetails, lView, tNode);
      if (tDetails.loadingState === DeferDependenciesLoadingState.IN_PROGRESS) {
        renderDeferStateAfterResourceLoading(tDetails, tNode, lContainer);
      }
      break;
    case DeferDependenciesLoadingState.IN_PROGRESS:
      renderDeferBlockState(DeferBlockState.Loading, tNode, lContainer);
      renderDeferStateAfterResourceLoading(tDetails, tNode, lContainer);
      break;
    case DeferDependenciesLoadingState.COMPLETE:
      ngDevMode && assertDeferredDependenciesLoaded(tDetails);
      renderDeferBlockState(DeferBlockState.Complete, tNode, lContainer);
      break;
    case DeferDependenciesLoadingState.FAILED:
      renderDeferBlockState(DeferBlockState.Error, tNode, lContainer);
      break;
    default:
      if (ngDevMode) {
        throwError("Unknown defer block state");
      }
  }
}
async function triggerHydrationFromBlockName(injector, blockName, replayQueuedEventsFn) {
  const dehydratedBlockRegistry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
  const blocksBeingHydrated = dehydratedBlockRegistry.hydrating;
  if (blocksBeingHydrated.has(blockName)) {
    return;
  }
  const {
    parentBlockPromise,
    hydrationQueue
  } = getParentBlockHydrationQueue(blockName, injector);
  if (hydrationQueue.length === 0) return;
  if (parentBlockPromise !== null) {
    hydrationQueue.shift();
  }
  populateHydratingStateForQueue(dehydratedBlockRegistry, hydrationQueue);
  if (parentBlockPromise !== null) {
    await parentBlockPromise;
  }
  const topmostParentBlock = hydrationQueue[0];
  if (dehydratedBlockRegistry.has(topmostParentBlock)) {
    await triggerHydrationForBlockQueue(injector, hydrationQueue, replayQueuedEventsFn);
  } else {
    dehydratedBlockRegistry.awaitParentBlock(topmostParentBlock, async () => await triggerHydrationForBlockQueue(injector, hydrationQueue, replayQueuedEventsFn));
  }
}
async function triggerHydrationForBlockQueue(injector, hydrationQueue, replayQueuedEventsFn) {
  const dehydratedBlockRegistry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
  const blocksBeingHydrated = dehydratedBlockRegistry.hydrating;
  const pendingTasks = injector.get(PendingTasksInternal);
  const taskId = pendingTasks.add();
  for (let blockQueueIdx = 0; blockQueueIdx < hydrationQueue.length; blockQueueIdx++) {
    const dehydratedBlockId = hydrationQueue[blockQueueIdx];
    const dehydratedDeferBlock = dehydratedBlockRegistry.get(dehydratedBlockId);
    if (dehydratedDeferBlock != null) {
      await triggerResourceLoadingForHydration(dehydratedDeferBlock);
      await nextRender(injector);
      if (deferBlockHasErrored(dehydratedDeferBlock)) {
        removeDehydratedViewList(dehydratedDeferBlock);
        cleanupRemainingHydrationQueue(hydrationQueue.slice(blockQueueIdx), dehydratedBlockRegistry);
        break;
      }
      blocksBeingHydrated.get(dehydratedBlockId).resolve();
    } else {
      cleanupParentContainer(blockQueueIdx, hydrationQueue, dehydratedBlockRegistry);
      cleanupRemainingHydrationQueue(hydrationQueue.slice(blockQueueIdx), dehydratedBlockRegistry);
      break;
    }
  }
  const lastBlockName = hydrationQueue[hydrationQueue.length - 1];
  await blocksBeingHydrated.get(lastBlockName)?.promise;
  pendingTasks.remove(taskId);
  if (replayQueuedEventsFn) {
    replayQueuedEventsFn(hydrationQueue);
  }
  cleanupHydratedDeferBlocks(dehydratedBlockRegistry.get(lastBlockName), hydrationQueue, dehydratedBlockRegistry, injector.get(ApplicationRef));
}
function deferBlockHasErrored(deferBlock) {
  return getLDeferBlockDetails(deferBlock.lView, deferBlock.tNode)[DEFER_BLOCK_STATE] === DeferBlockState.Error;
}
function cleanupParentContainer(currentBlockIdx, hydrationQueue, dehydratedBlockRegistry) {
  const parentDeferBlockIdx = currentBlockIdx - 1;
  const parentDeferBlock = parentDeferBlockIdx > -1 ? dehydratedBlockRegistry.get(hydrationQueue[parentDeferBlockIdx]) : null;
  if (parentDeferBlock) {
    cleanupLContainer(parentDeferBlock.lContainer);
  }
}
function cleanupRemainingHydrationQueue(hydrationQueue, dehydratedBlockRegistry) {
  const blocksBeingHydrated = dehydratedBlockRegistry.hydrating;
  for (const dehydratedBlockId in hydrationQueue) {
    blocksBeingHydrated.get(dehydratedBlockId)?.reject();
  }
  dehydratedBlockRegistry.cleanup(hydrationQueue);
}
function populateHydratingStateForQueue(registry, queue) {
  for (let blockId of queue) {
    registry.hydrating.set(blockId, promiseWithResolvers());
  }
}
function nextRender(injector) {
  return new Promise((resolveFn) => afterNextRender(resolveFn, {
    injector
  }));
}
async function triggerResourceLoadingForHydration(dehydratedBlock) {
  const {
    tNode,
    lView
  } = dehydratedBlock;
  const lDetails = getLDeferBlockDetails(lView, tNode);
  return new Promise((resolve) => {
    onDeferBlockCompletion(lDetails, resolve);
    triggerDeferBlock(2, lView, tNode);
  });
}
function onDeferBlockCompletion(lDetails, callback) {
  if (!Array.isArray(lDetails[ON_COMPLETE_FNS])) {
    lDetails[ON_COMPLETE_FNS] = [];
  }
  lDetails[ON_COMPLETE_FNS].push(callback);
}
function shouldAttachTrigger(triggerType, lView, tNode) {
  if (triggerType === 0) {
    return shouldAttachRegularTrigger(lView, tNode);
  } else if (triggerType === 2) {
    return !shouldAttachRegularTrigger(lView, tNode);
  }
  return true;
}
function hasHydrateTriggers(flags) {
  return flags != null && (flags & 1) === 1;
}
function shouldAttachRegularTrigger(lView, tNode) {
  const injector = lView[INJECTOR];
  const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
  const incrementalHydrationEnabled = isIncrementalHydrationEnabled(injector);
  const _hasHydrateTriggers = hasHydrateTriggers(tDetails.flags);
  if (false) {
    return !incrementalHydrationEnabled || !_hasHydrateTriggers;
  }
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const wasServerSideRendered = lDetails[SSR_UNIQUE_ID] !== null;
  if (_hasHydrateTriggers && wasServerSideRendered && incrementalHydrationEnabled) {
    return false;
  }
  return true;
}
function getHydrateTriggers(tView, tNode) {
  const tDetails = getTDeferBlockDetails(tView, tNode);
  return tDetails.hydrateTriggers ??= /* @__PURE__ */ new Map();
}
function processAndInitTriggers(injector, blockData, nodes) {
  const idleElements = [];
  const timerElements = [];
  const viewportElements = [];
  const immediateElements = [];
  for (let [blockId, blockSummary] of blockData) {
    const commentNode = nodes.get(blockId);
    if (commentNode !== void 0) {
      const numRootNodes = blockSummary.data[NUM_ROOT_NODES];
      let currentNode = commentNode;
      for (let i = 0; i < numRootNodes; i++) {
        currentNode = currentNode.previousSibling;
        if (currentNode.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }
        const elementTrigger = {
          el: currentNode,
          blockName: blockId
        };
        if (blockSummary.hydrate.idle) {
          idleElements.push(elementTrigger);
        }
        if (blockSummary.hydrate.immediate) {
          immediateElements.push(elementTrigger);
        }
        if (blockSummary.hydrate.timer !== null) {
          elementTrigger.delay = blockSummary.hydrate.timer;
          timerElements.push(elementTrigger);
        }
        if (blockSummary.hydrate.viewport) {
          if (typeof blockSummary.hydrate.viewport !== "boolean") {
            elementTrigger.intersectionObserverOptions = blockSummary.hydrate.viewport;
          }
          viewportElements.push(elementTrigger);
        }
      }
    }
  }
  setIdleTriggers(injector, idleElements);
  setImmediateTriggers(injector, immediateElements);
  setViewportTriggers(injector, viewportElements);
  setTimerTriggers(injector, timerElements);
}
function setIdleTriggers(injector, elementTriggers) {
  for (const elementTrigger of elementTriggers) {
    const registry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
    const onInvoke = () => triggerHydrationFromBlockName(injector, elementTrigger.blockName);
    const cleanupFn = onIdle(onInvoke, injector);
    registry.addCleanupFn(elementTrigger.blockName, cleanupFn);
  }
}
function setViewportTriggers(injector, elementTriggers) {
  if (elementTriggers.length > 0) {
    const registry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
    for (let elementTrigger of elementTriggers) {
      const cleanupFn = onViewportWrapper(elementTrigger.el, () => triggerHydrationFromBlockName(injector, elementTrigger.blockName), injector, elementTrigger.intersectionObserverOptions);
      registry.addCleanupFn(elementTrigger.blockName, cleanupFn);
    }
  }
}
function setTimerTriggers(injector, elementTriggers) {
  for (const elementTrigger of elementTriggers) {
    const registry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
    const onInvoke = () => triggerHydrationFromBlockName(injector, elementTrigger.blockName);
    const timerFn = onTimer(elementTrigger.delay);
    const cleanupFn = timerFn(onInvoke, injector);
    registry.addCleanupFn(elementTrigger.blockName, cleanupFn);
  }
}
function setImmediateTriggers(injector, elementTriggers) {
  for (const elementTrigger of elementTriggers) {
    triggerHydrationFromBlockName(injector, elementTrigger.blockName);
  }
}
var _hmrWarningProduced = false;
function logHmrWarning(injector) {
  if (!_hmrWarningProduced) {
    _hmrWarningProduced = true;
    const console2 = injector.get(Console);
    console2.log(formatRuntimeError(-751, "Angular has detected that this application contains `@defer` blocks and the hot module replacement (HMR) mode is enabled. All `@defer` block dependencies will be loaded eagerly."));
  }
}
function ɵɵdefer(index, primaryTmplIndex, dependencyResolverFn, loadingTmplIndex, placeholderTmplIndex, errorTmplIndex, loadingConfigIndex, placeholderConfigIndex, enableTimerScheduling, flags) {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = declareNoDirectiveHostTemplate(lView, tView, index, null, 0, 0);
  const injector = lView[INJECTOR];
  const incrementalHydrationEnabled = isIncrementalHydrationEnabled(injector);
  if (tView.firstCreatePass) {
    performanceMarkFeature("NgDefer");
    if (ngDevMode) {
      if (true) {
        logHmrWarning(injector);
      }
      if (hasHydrateTriggers(flags) && !incrementalHydrationEnabled) {
        warnIncrementalHydrationNotConfigured();
      }
    }
    const tDetails = {
      primaryTmplIndex,
      loadingTmplIndex: loadingTmplIndex ?? null,
      placeholderTmplIndex: placeholderTmplIndex ?? null,
      errorTmplIndex: errorTmplIndex ?? null,
      placeholderBlockConfig: null,
      loadingBlockConfig: null,
      dependencyResolverFn: dependencyResolverFn ?? null,
      loadingState: DeferDependenciesLoadingState.NOT_STARTED,
      loadingPromise: null,
      providers: null,
      hydrateTriggers: null,
      debug: null,
      flags: flags ?? 0
    };
    enableTimerScheduling?.(tView, tDetails, placeholderConfigIndex, loadingConfigIndex);
    setTDeferBlockDetails(tView, adjustedIndex, tDetails);
  }
  const lContainer = lView[adjustedIndex];
  populateDehydratedViewsInLContainer(lContainer, tNode, lView);
  let ssrBlockState = null;
  let ssrUniqueId = null;
  if (lContainer[DEHYDRATED_VIEWS]?.length > 0) {
    const info = lContainer[DEHYDRATED_VIEWS][0].data;
    ssrUniqueId = info[DEFER_BLOCK_ID] ?? null;
    ssrBlockState = info[DEFER_BLOCK_STATE$1];
  }
  const lDetails = [null, DeferBlockInternalState.Initial, null, null, null, null, ssrUniqueId, ssrBlockState, null, null];
  setLDeferBlockDetails(lView, adjustedIndex, lDetails);
  let registry = null;
  if (ssrUniqueId !== null && incrementalHydrationEnabled) {
    registry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
    registry.add(ssrUniqueId, {
      lView,
      tNode,
      lContainer
    });
  }
  const onLViewDestroy = () => {
    invokeAllTriggerCleanupFns(lDetails);
    if (ssrUniqueId !== null) {
      registry?.cleanup([ssrUniqueId]);
    }
  };
  storeTriggerCleanupFn(0, lDetails, () => removeLViewOnDestroy(lView, onLViewDestroy));
  storeLViewOnDestroy(lView, onLViewDestroy);
}
function ɵɵdeferWhen(rawValue) {
  const lView = getLView();
  const tNode = getSelectedTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "when <expression>");
  }
  if (!shouldAttachTrigger(0, lView, tNode)) return;
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, rawValue)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      const value = Boolean(rawValue);
      const lDetails = getLDeferBlockDetails(lView, tNode);
      const renderedState = lDetails[DEFER_BLOCK_STATE];
      if (value === false && renderedState === DeferBlockInternalState.Initial) {
        renderPlaceholder(lView, tNode);
      } else if (value === true && (renderedState === DeferBlockInternalState.Initial || renderedState === DeferBlockState.Placeholder)) {
        triggerDeferBlock(0, lView, tNode);
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}
function ɵɵdeferPrefetchWhen(rawValue) {
  const lView = getLView();
  const tNode = getSelectedTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "prefetch when <expression>");
  }
  if (!shouldAttachTrigger(1, lView, tNode)) return;
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, rawValue)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      const value = Boolean(rawValue);
      const tView = lView[TVIEW];
      const tDetails = getTDeferBlockDetails(tView, tNode);
      if (value === true && tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
        triggerPrefetching(tDetails, lView, tNode);
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}
function ɵɵdeferHydrateWhen(rawValue) {
  const lView = getLView();
  const tNode = getSelectedTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "hydrate when <expression>");
  }
  if (!shouldAttachTrigger(2, lView, tNode)) return;
  const bindingIndex = nextBindingIndex();
  const tView = getTView();
  const hydrateTriggers = getHydrateTriggers(tView, tNode);
  hydrateTriggers.set(6, null);
  if (bindingUpdated(lView, bindingIndex, rawValue)) {
    if (false) {
      triggerDeferBlock(2, lView, tNode);
    } else {
      const injector = lView[INJECTOR];
      const prevConsumer = setActiveConsumer(null);
      try {
        const value = Boolean(rawValue);
        if (value === true) {
          const lDetails = getLDeferBlockDetails(lView, tNode);
          const ssrUniqueId = lDetails[SSR_UNIQUE_ID];
          ngDevMode && assertSsrIdDefined(ssrUniqueId);
          triggerHydrationFromBlockName(injector, ssrUniqueId);
        }
      } finally {
        setActiveConsumer(prevConsumer);
      }
    }
  }
}
function ɵɵdeferHydrateNever() {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "hydrate never");
  }
  if (!shouldAttachTrigger(2, lView, tNode)) return;
  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(7, null);
  if (false) {
    triggerDeferBlock(2, lView, tNode);
  }
}
function ɵɵdeferOnIdle() {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "on idle");
  }
  if (!shouldAttachTrigger(0, lView, tNode)) return;
  scheduleDelayedTrigger(onIdle);
}
function ɵɵdeferPrefetchOnIdle() {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "prefetch on idle");
  }
  if (!shouldAttachTrigger(1, lView, tNode)) return;
  scheduleDelayedPrefetching(onIdle);
}
function ɵɵdeferHydrateOnIdle() {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "hydrate on idle");
  }
  if (!shouldAttachTrigger(2, lView, tNode)) return;
  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(0, null);
  if (false) {
    triggerDeferBlock(2, lView, tNode);
  } else {
    scheduleDelayedHydrating(onIdle, lView, tNode);
  }
}
function ɵɵdeferOnImmediate() {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "on immediate");
  }
  if (!shouldAttachTrigger(0, lView, tNode)) return;
  const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
  if (tDetails.loadingTmplIndex === null) {
    renderPlaceholder(lView, tNode);
  }
  triggerDeferBlock(0, lView, tNode);
}
function ɵɵdeferPrefetchOnImmediate() {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "prefetch on immediate");
  }
  if (!shouldAttachTrigger(1, lView, tNode)) return;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);
  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    triggerResourceLoading(tDetails, lView, tNode);
  }
}
function ɵɵdeferHydrateOnImmediate() {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "hydrate on immediate");
  }
  if (!shouldAttachTrigger(2, lView, tNode)) return;
  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(1, null);
  if (false) {
    triggerDeferBlock(2, lView, tNode);
  } else {
    const injector = lView[INJECTOR];
    const lDetails = getLDeferBlockDetails(lView, tNode);
    const ssrUniqueId = lDetails[SSR_UNIQUE_ID];
    ngDevMode && assertSsrIdDefined(ssrUniqueId);
    triggerHydrationFromBlockName(injector, ssrUniqueId);
  }
}
function ɵɵdeferOnTimer(delay) {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, `on timer(${delay}ms)`);
  }
  if (!shouldAttachTrigger(0, lView, tNode)) return;
  scheduleDelayedTrigger(onTimer(delay));
}
function ɵɵdeferPrefetchOnTimer(delay) {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, `prefetch on timer(${delay}ms)`);
  }
  if (!shouldAttachTrigger(1, lView, tNode)) return;
  scheduleDelayedPrefetching(onTimer(delay));
}
function ɵɵdeferHydrateOnTimer(delay) {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, `hydrate on timer(${delay}ms)`);
  }
  if (!shouldAttachTrigger(2, lView, tNode)) return;
  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(5, {
    type: 5,
    delay
  });
  if (false) {
    triggerDeferBlock(2, lView, tNode);
  } else {
    scheduleDelayedHydrating(onTimer(delay), lView, tNode);
  }
}
function ɵɵdeferOnHover(triggerIndex, walkUpTimes) {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, `on hover${walkUpTimes === -1 ? "" : "(<target>)"}`);
  }
  if (!shouldAttachTrigger(0, lView, tNode)) return;
  renderPlaceholder(lView, tNode);
  if (true) {
    registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onHover, () => triggerDeferBlock(0, lView, tNode), 0);
  }
}
function ɵɵdeferPrefetchOnHover(triggerIndex, walkUpTimes) {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, `prefetch on hover${walkUpTimes === -1 ? "" : "(<target>)"}`);
  }
  if (!shouldAttachTrigger(1, lView, tNode)) return;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);
  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onHover, () => triggerPrefetching(tDetails, lView, tNode), 1);
  }
}
function ɵɵdeferHydrateOnHover() {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "hydrate on hover");
  }
  if (!shouldAttachTrigger(2, lView, tNode)) return;
  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(4, null);
  if (false) {
    triggerDeferBlock(2, lView, tNode);
  }
}
function ɵɵdeferOnInteraction(triggerIndex, walkUpTimes) {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, `on interaction${walkUpTimes === -1 ? "" : "(<target>)"}`);
  }
  if (!shouldAttachTrigger(0, lView, tNode)) return;
  renderPlaceholder(lView, tNode);
  if (true) {
    registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onInteraction, () => triggerDeferBlock(0, lView, tNode), 0);
  }
}
function ɵɵdeferPrefetchOnInteraction(triggerIndex, walkUpTimes) {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, `prefetch on interaction${walkUpTimes === -1 ? "" : "(<target>)"}`);
  }
  if (!shouldAttachTrigger(1, lView, tNode)) return;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);
  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onInteraction, () => triggerPrefetching(tDetails, lView, tNode), 1);
  }
}
function ɵɵdeferHydrateOnInteraction() {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, "hydrate on interaction");
  }
  if (!shouldAttachTrigger(2, lView, tNode)) return;
  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(3, null);
  if (false) {
    triggerDeferBlock(2, lView, tNode);
  }
}
function ɵɵdeferOnViewport(triggerIndex, walkUpTimes, options) {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    const args = [];
    if (walkUpTimes !== void 0 && walkUpTimes !== -1) {
      args.push("<target>");
    }
    if (options) {
      args.push(JSON.stringify(options));
    }
    trackTriggerForDebugging(lView[TVIEW], tNode, `on viewport${args.length === 0 ? "" : `(${args.join(", ")})`}`);
  }
  if (!shouldAttachTrigger(0, lView, tNode)) return;
  renderPlaceholder(lView, tNode);
  if (true) {
    registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onViewportWrapper, () => triggerDeferBlock(0, lView, tNode), 0, options);
  }
}
function ɵɵdeferPrefetchOnViewport(triggerIndex, walkUpTimes, options) {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    const args = [];
    if (walkUpTimes !== void 0 && walkUpTimes !== -1) {
      args.push("<target>");
    }
    if (options) {
      args.push(JSON.stringify(options));
    }
    trackTriggerForDebugging(lView[TVIEW], tNode, `prefetch on viewport${args.length === 0 ? "" : `(${args.join(", ")})`}`);
  }
  if (!shouldAttachTrigger(1, lView, tNode)) return;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);
  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    registerDomTrigger(lView, tNode, triggerIndex, walkUpTimes, onViewportWrapper, () => triggerPrefetching(tDetails, lView, tNode), 1, options);
  }
}
function ɵɵdeferHydrateOnViewport(options) {
  const lView = getLView();
  const tNode = getCurrentTNode();
  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, `hydrate on viewport${options ? `(${JSON.stringify(options)})` : ""}`);
  }
  if (!shouldAttachTrigger(2, lView, tNode)) return;
  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(2, options ? {
    type: 2,
    intersectionObserverOptions: options
  } : null);
  if (false) {
    triggerDeferBlock(2, lView, tNode);
  }
}
function ɵɵariaProperty(name, value) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    const hasSetInput = setAllInputsForProperty(tNode, tView, lView, name, value);
    if (hasSetInput) {
      isComponentHost(tNode) && markDirtyIfOnPush(lView, tNode.index);
      ngDevMode && setNgReflectProperties(lView, tView, tNode, name, value);
    } else {
      ngDevMode && assertTNodeType(tNode, 2);
      const element = getNativeByTNode(tNode, lView);
      setElementAttribute(lView[RENDERER], element, null, tNode.value, name, value, null);
    }
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, name, bindingIndex);
  }
  return ɵɵariaProperty;
}
function ɵɵattribute(name, value, sanitizer, namespace) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementAttributeInternal(tNode, lView, name, value, sanitizer, namespace);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, "attr." + name, bindingIndex);
  }
  return ɵɵattribute;
}
var ANIMATIONS_DISABLED = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "AnimationsDisabled" : "", {
  factory: () => false
});
var MAX_ANIMATION_TIMEOUT = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "MaxAnimationTimeout" : "", {
  factory: () => MAX_ANIMATION_TIMEOUT_DEFAULT
});
var MAX_ANIMATION_TIMEOUT_DEFAULT = 4e3;
var DEFAULT_ANIMATIONS_DISABLED = false;
var areAnimationSupported = typeof document !== "undefined" && typeof document?.documentElement?.getAnimations === "function";
function areAnimationsDisabled(lView) {
  const injector = lView[INJECTOR];
  return injector.get(ANIMATIONS_DISABLED, DEFAULT_ANIMATIONS_DISABLED);
}
function assertAnimationTypes(value, instruction) {
  if (value == null || typeof value !== "string" && typeof value !== "function") {
    throw new RuntimeError(650, `'${instruction}' value must be a string of CSS classes or an animation function, got ${stringify(value)}`);
  }
}
function assertElementNodes(nativeElement, instruction) {
  if (nativeElement.nodeType !== Node.ELEMENT_NODE) {
    throw new RuntimeError(650, `'${instruction}' can only be used on an element node, got ${stringify(nativeElement.nodeType)}`);
  }
}
function trackEnterClasses(el, classList, cleanupFns) {
  const elementData = enterClassMap.get(el);
  if (elementData) {
    for (const klass of classList) {
      elementData.classList.push(klass);
    }
    for (const fn of cleanupFns) {
      elementData.cleanupFns.push(fn);
    }
  } else {
    enterClassMap.set(el, {
      classList,
      cleanupFns
    });
  }
}
function cleanupEnterClassData(element) {
  const elementData = enterClassMap.get(element);
  if (elementData) {
    for (const fn of elementData.cleanupFns) {
      fn();
    }
    enterClassMap.delete(element);
  }
  longestAnimations.delete(element);
}
var noOpAnimationComplete = () => {
};
var enterClassMap = /* @__PURE__ */ new WeakMap();
var longestAnimations = /* @__PURE__ */ new WeakMap();
var leavingNodes = /* @__PURE__ */ new WeakMap();
function clearLeavingNodes(tNode, el) {
  const nodes = leavingNodes.get(tNode);
  if (nodes && nodes.length > 0) {
    const ix = nodes.findIndex((node) => node === el);
    if (ix > -1) nodes.splice(ix, 1);
  }
  if (nodes?.length === 0) {
    leavingNodes.delete(tNode);
  }
}
function cancelLeavingNodes(tNode, lView) {
  const leavingEl = leavingNodes.get(tNode)?.shift();
  const lContainer = lView[DECLARATION_LCONTAINER];
  if (lContainer) {
    const beforeNode = getBeforeNodeForView(tNode.index, lContainer);
    const previousNode = beforeNode?.previousSibling;
    if (leavingEl && previousNode && leavingEl === previousNode) {
      leavingEl.dispatchEvent(new CustomEvent("animationend", {
        detail: {
          cancel: true
        }
      }));
    }
  }
}
function trackLeavingNodes(tNode, el) {
  if (leavingNodes.has(tNode)) {
    leavingNodes.get(tNode)?.push(el);
  } else {
    leavingNodes.set(tNode, [el]);
  }
}
function getLViewEnterAnimations(lView) {
  const animationData = lView[ANIMATIONS] ??= {};
  return animationData.enter ??= /* @__PURE__ */ new Map();
}
function getLViewLeaveAnimations(lView) {
  const animationData = lView[ANIMATIONS] ??= {};
  return animationData.leave ??= /* @__PURE__ */ new Map();
}
function getClassListFromValue(value) {
  const classes = typeof value === "function" ? value() : value;
  let classList = Array.isArray(classes) ? classes : null;
  if (typeof classes === "string") {
    classList = classes.trim().split(/\s+/).filter((k) => k);
  }
  return classList;
}
function cancelAnimationsIfRunning(element, renderer) {
  if (!areAnimationSupported) return;
  const elementData = enterClassMap.get(element);
  if (elementData && elementData.classList.length > 0 && elementHasClassList(element, elementData.classList)) {
    for (const klass of elementData.classList) {
      renderer.removeClass(element, klass);
    }
  }
  cleanupEnterClassData(element);
}
function elementHasClassList(element, classList) {
  for (const className of classList) {
    if (element.classList.contains(className)) return true;
  }
  return false;
}
function isLongestAnimation(event, nativeElement) {
  const longestAnimation = longestAnimations.get(nativeElement);
  if (longestAnimation === void 0) return true;
  return nativeElement === event.target && (longestAnimation.animationName !== void 0 && event.animationName === longestAnimation.animationName || longestAnimation.propertyName !== void 0 && event.propertyName === longestAnimation.propertyName);
}
function addAnimationToLView(animations, tNode, fn) {
  const nodeAnimations = animations.get(tNode.index) ?? {
    animateFns: []
  };
  nodeAnimations.animateFns.push(fn);
  animations.set(tNode.index, nodeAnimations);
}
function cleanupAfterLeaveAnimations(resolvers, cleanupFns) {
  if (resolvers) {
    for (const fn of resolvers) {
      fn();
    }
  }
  for (const fn of cleanupFns) {
    fn();
  }
}
function clearLViewNodeAnimationResolvers(lView, tNode) {
  const nodeAnimations = getLViewLeaveAnimations(lView).get(tNode.index);
  if (nodeAnimations) nodeAnimations.resolvers = void 0;
}
function leaveAnimationFunctionCleanup(lView, tNode, nativeElement, resolvers, cleanupFns) {
  clearLeavingNodes(tNode, nativeElement);
  cleanupAfterLeaveAnimations(resolvers, cleanupFns);
  clearLViewNodeAnimationResolvers(lView, tNode);
}
function ɵɵanimateEnter(value) {
  performanceMarkFeature("NgAnimateEnter");
  if (!areAnimationSupported) {
    return ɵɵanimateEnter;
  }
  ngDevMode && assertAnimationTypes(value, "animate.enter");
  const lView = getLView();
  if (areAnimationsDisabled(lView)) {
    return ɵɵanimateEnter;
  }
  const tNode = getCurrentTNode();
  cancelLeavingNodes(tNode, lView);
  const ngZone = lView[INJECTOR].get(NgZone);
  addAnimationToLView(getLViewEnterAnimations(lView), tNode, () => runEnterAnimation(lView, tNode, value, ngZone));
  initializeAnimationQueueScheduler(lView[INJECTOR]);
  queueEnterAnimations(lView[INJECTOR], getLViewEnterAnimations(lView));
  return ɵɵanimateEnter;
}
function runEnterAnimation(lView, tNode, value, ngZone) {
  const nativeElement = getNativeByTNode(tNode, lView);
  ngDevMode && assertElementNodes(nativeElement, "animate.enter");
  const renderer = lView[RENDERER];
  const activeClasses = getClassListFromValue(value);
  const cleanupFns = [];
  const handleEnterAnimationStart = (event) => {
    if (event.target !== nativeElement) return;
    const eventName = event instanceof AnimationEvent ? "animationend" : "transitionend";
    ngZone.runOutsideAngular(() => {
      renderer.listen(nativeElement, eventName, handleEnterAnimationEnd);
    });
  };
  const handleEnterAnimationEnd = (event) => {
    if (event.target !== nativeElement) return;
    enterAnimationEnd(event, nativeElement, renderer);
  };
  if (activeClasses && activeClasses.length > 0) {
    ngZone.runOutsideAngular(() => {
      cleanupFns.push(renderer.listen(nativeElement, "animationstart", handleEnterAnimationStart));
      cleanupFns.push(renderer.listen(nativeElement, "transitionstart", handleEnterAnimationStart));
    });
    trackEnterClasses(nativeElement, activeClasses, cleanupFns);
    for (const klass of activeClasses) {
      renderer.addClass(nativeElement, klass);
    }
    ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        determineLongestAnimation(nativeElement, longestAnimations, areAnimationSupported);
        if (!longestAnimations.has(nativeElement)) {
          for (const klass of activeClasses) {
            renderer.removeClass(nativeElement, klass);
          }
          cleanupEnterClassData(nativeElement);
        }
      });
    });
  }
}
function enterAnimationEnd(event, nativeElement, renderer) {
  const elementData = enterClassMap.get(nativeElement);
  if (event.target !== nativeElement || !elementData) return;
  if (isLongestAnimation(event, nativeElement)) {
    event.stopImmediatePropagation();
    for (const klass of elementData.classList) {
      renderer.removeClass(nativeElement, klass);
    }
    cleanupEnterClassData(nativeElement);
  }
}
function ɵɵanimateEnterListener(value) {
  performanceMarkFeature("NgAnimateEnter");
  if (!areAnimationSupported) {
    return ɵɵanimateEnterListener;
  }
  ngDevMode && assertAnimationTypes(value, "animate.enter");
  const lView = getLView();
  if (areAnimationsDisabled(lView)) {
    return ɵɵanimateEnterListener;
  }
  const tNode = getCurrentTNode();
  cancelLeavingNodes(tNode, lView);
  addAnimationToLView(getLViewEnterAnimations(lView), tNode, () => runEnterAnimationFunction(lView, tNode, value));
  initializeAnimationQueueScheduler(lView[INJECTOR]);
  queueEnterAnimations(lView[INJECTOR], getLViewEnterAnimations(lView));
  return ɵɵanimateEnterListener;
}
function runEnterAnimationFunction(lView, tNode, value) {
  const nativeElement = getNativeByTNode(tNode, lView);
  ngDevMode && assertElementNodes(nativeElement, "animate.enter");
  value.call(lView[CONTEXT], {
    target: nativeElement,
    animationComplete: noOpAnimationComplete
  });
}
function ɵɵanimateLeave(value) {
  performanceMarkFeature("NgAnimateLeave");
  if (!areAnimationSupported) {
    return ɵɵanimateLeave;
  }
  ngDevMode && assertAnimationTypes(value, "animate.leave");
  const lView = getLView();
  const animationsDisabled = areAnimationsDisabled(lView);
  if (animationsDisabled) {
    return ɵɵanimateLeave;
  }
  const tNode = getCurrentTNode();
  cancelLeavingNodes(tNode, lView);
  const ngZone = lView[INJECTOR].get(NgZone);
  addAnimationToLView(getLViewLeaveAnimations(lView), tNode, () => runLeaveAnimations(lView, tNode, value, ngZone));
  initializeAnimationQueueScheduler(lView[INJECTOR]);
  return ɵɵanimateLeave;
}
function runLeaveAnimations(lView, tNode, value, ngZone) {
  const {
    promise,
    resolve
  } = promiseWithResolvers();
  const nativeElement = getNativeByTNode(tNode, lView);
  ngDevMode && assertElementNodes(nativeElement, "animate.leave");
  const renderer = lView[RENDERER];
  allLeavingAnimations.add(lView[ID]);
  (getLViewLeaveAnimations(lView).get(tNode.index).resolvers ??= []).push(resolve);
  const activeClasses = getClassListFromValue(value);
  if (activeClasses && activeClasses.length > 0) {
    animateLeaveClassRunner(nativeElement, tNode, lView, activeClasses, renderer, ngZone);
  } else {
    resolve();
  }
  return {
    promise,
    resolve
  };
}
function animateLeaveClassRunner(el, tNode, lView, classList, renderer, ngZone) {
  cancelAnimationsIfRunning(el, renderer);
  const cleanupFns = [];
  const resolvers = getLViewLeaveAnimations(lView).get(tNode.index)?.resolvers;
  const handleOutAnimationEnd = (event) => {
    if (event.target !== el) return;
    if (event instanceof CustomEvent || isLongestAnimation(event, el)) {
      event.stopImmediatePropagation();
      longestAnimations.delete(el);
      clearLeavingNodes(tNode, el);
      if (Array.isArray(tNode.projection)) {
        for (const item of classList) {
          renderer.removeClass(el, item);
        }
      }
      cleanupAfterLeaveAnimations(resolvers, cleanupFns);
      clearLViewNodeAnimationResolvers(lView, tNode);
    }
  };
  ngZone.runOutsideAngular(() => {
    cleanupFns.push(renderer.listen(el, "animationend", handleOutAnimationEnd));
    cleanupFns.push(renderer.listen(el, "transitionend", handleOutAnimationEnd));
  });
  trackLeavingNodes(tNode, el);
  for (const item of classList) {
    renderer.addClass(el, item);
  }
  ngZone.runOutsideAngular(() => {
    requestAnimationFrame(() => {
      determineLongestAnimation(el, longestAnimations, areAnimationSupported);
      if (!longestAnimations.has(el)) {
        clearLeavingNodes(tNode, el);
        cleanupAfterLeaveAnimations(resolvers, cleanupFns);
        clearLViewNodeAnimationResolvers(lView, tNode);
      }
    });
  });
}
function ɵɵanimateLeaveListener(value) {
  performanceMarkFeature("NgAnimateLeave");
  if (!areAnimationSupported) {
    return ɵɵanimateLeaveListener;
  }
  ngDevMode && assertAnimationTypes(value, "animate.leave");
  const lView = getLView();
  const tNode = getCurrentTNode();
  cancelLeavingNodes(tNode, lView);
  allLeavingAnimations.add(lView[ID]);
  const ngZone = lView[INJECTOR].get(NgZone);
  const maxAnimationTimeout = lView[INJECTOR].get(MAX_ANIMATION_TIMEOUT);
  addAnimationToLView(getLViewLeaveAnimations(lView), tNode, () => runLeaveAnimationFunction(lView, tNode, value, ngZone, maxAnimationTimeout));
  initializeAnimationQueueScheduler(lView[INJECTOR]);
  return ɵɵanimateLeaveListener;
}
function runLeaveAnimationFunction(lView, tNode, value, ngZone, maxAnimationTimeout) {
  const {
    promise,
    resolve
  } = promiseWithResolvers();
  const nativeElement = getNativeByTNode(tNode, lView);
  ngDevMode && assertElementNodes(nativeElement, "animate.leave");
  const cleanupFns = [];
  const renderer = lView[RENDERER];
  const animationsDisabled = areAnimationsDisabled(lView);
  (getLViewLeaveAnimations(lView).get(tNode.index).resolvers ??= []).push(resolve);
  const resolvers = getLViewLeaveAnimations(lView).get(tNode.index)?.resolvers;
  if (animationsDisabled) {
    leaveAnimationFunctionCleanup(lView, tNode, nativeElement, resolvers, cleanupFns);
  } else {
    const timeoutId = setTimeout(() => leaveAnimationFunctionCleanup(lView, tNode, nativeElement, resolvers, cleanupFns), maxAnimationTimeout);
    const event = {
      target: nativeElement,
      animationComplete: () => {
        leaveAnimationFunctionCleanup(lView, tNode, nativeElement, resolvers, cleanupFns);
        clearTimeout(timeoutId);
      }
    };
    trackLeavingNodes(tNode, nativeElement);
    ngZone.runOutsideAngular(() => {
      cleanupFns.push(renderer.listen(nativeElement, "animationend", () => {
        leaveAnimationFunctionCleanup(lView, tNode, nativeElement, resolvers, cleanupFns);
        clearTimeout(timeoutId);
      }, {
        once: true
      }));
    });
    value.call(lView[CONTEXT], event);
  }
  return {
    promise,
    resolve
  };
}
function ɵɵcomponentInstance() {
  const instance = getLView()[DECLARATION_COMPONENT_VIEW][CONTEXT];
  ngDevMode && assertDefined(instance, "Expected component instance to be defined");
  return instance;
}
function ɵɵcontrolCreate() {
  const lView = getLView();
  const tView = getTView();
  const tNode = getCurrentTNode();
  if (tView.firstCreatePass) {
    initializeControlFirstCreatePass(tView, tNode, lView);
  }
  const fieldDirective = getFieldDirective(tNode, lView);
  if (!fieldDirective) {
    return;
  }
  performanceMarkFeature("NgSignalForms");
  if (tNode.flags & 1024) {
    initializeCustomControl(lView, tNode, fieldDirective, "value");
  } else if (tNode.flags & 2048) {
    initializeCustomControl(lView, tNode, fieldDirective, "checked");
  } else if (tNode.flags & 4096) {
    initializeInteropControl(fieldDirective);
  } else if (tNode.flags & 8192) {
    initializeNativeControl(lView, tNode, fieldDirective);
  }
  fieldDirective.registerAsBinding(getCustomControl(tNode, lView));
}
function ɵɵcontrol(value, name, sanitizer) {
  const lView = getLView();
  const tNode = getSelectedTNode();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    setPropertyAndInputs(tNode, lView, name, value, lView[RENDERER], sanitizer);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, name, bindingIndex);
  }
  updateControl(lView, tNode);
}
function ɵcontrolUpdate() {
  const lView = getLView();
  const tNode = getSelectedTNode();
  updateControl(lView, tNode);
}
function updateControl(lView, tNode) {
  const fieldDirective = getFieldDirective(tNode, lView);
  if (fieldDirective) {
    updateControlClasses(lView, tNode, fieldDirective);
    if (tNode.flags & 1024) {
      updateCustomControl(tNode, lView, fieldDirective, "value");
    } else if (tNode.flags & 2048) {
      updateCustomControl(tNode, lView, fieldDirective, "checked");
    } else if (tNode.flags & 4096) {
      updateInteropControl(tNode, lView, fieldDirective);
    } else {
      updateNativeControl(tNode, lView, fieldDirective);
    }
  }
  nextBindingIndex();
}
function initializeControlFirstCreatePass(tView, tNode, lView) {
  ngDevMode && assertFirstCreatePass(tView);
  const directiveIndices = tNode.inputs?.["formField"];
  if (!directiveIndices) {
    return;
  }
  if (isComponentHost(tNode) && directiveIndices.includes(tNode.directiveStart + tNode.componentOffset)) {
    return;
  }
  const controlIndex = directiveIndices.find((index) => ɵCONTROL in lView[index]);
  if (controlIndex === void 0) {
    return;
  }
  tNode.fieldIndex = controlIndex;
  const foundControl = isInteropControlFirstCreatePass(tNode, lView) || isCustomControlFirstCreatePass(tView, tNode);
  if (isNativeControlFirstCreatePass(tNode) || foundControl) {
    return;
  }
  throw new RuntimeError(318, ngDevMode && `${describeElement(tView, tNode)} is an invalid [formField] directive host. The host must be a native form control (such as <input>', '<select>', or '<textarea>') or a custom form control with a 'value' or 'checked' model.`);
}
function describeElement(tView, tNode) {
  if (ngDevMode && isComponentHost(tNode)) {
    const componentIndex = tNode.directiveStart + tNode.componentOffset;
    const componentDef = tView.data[componentIndex];
    return `Component ${debugStringifyTypeForError(componentDef.type)}`;
  }
  return `<${tNode.value}>`;
}
function isInteropControlFirstCreatePass(tNode, lView) {
  const control = lView[tNode.fieldIndex];
  if (control.ɵinteropControl) {
    tNode.flags |= 4096;
    return true;
  }
  return false;
}
function isCustomControlFirstCreatePass(tView, tNode) {
  for (let i = tNode.directiveStart; i < tNode.directiveEnd; i++) {
    const directiveDef = tView.data[i];
    if (hasModelInput(directiveDef, "value")) {
      tNode.flags |= 1024;
      tNode.customControlIndex = i;
      return true;
    }
    if (hasModelInput(directiveDef, "checked")) {
      tNode.flags |= 2048;
      tNode.customControlIndex = i;
      return true;
    }
  }
  return false;
}
function isNativeControlFirstCreatePass(tNode) {
  if (!isNativeControl(tNode)) {
    return false;
  }
  tNode.flags |= 8192;
  if (isNumericInput(tNode)) {
    tNode.flags |= 16384;
  }
  if (isTextControl(tNode)) {
    tNode.flags |= 32768;
  }
  return true;
}
function getFieldDirective(tNode, lView) {
  const index = tNode.fieldIndex;
  return index === -1 ? void 0 : lView[index];
}
function getCustomControl(tNode, lView) {
  const index = tNode.customControlIndex;
  return index === -1 ? void 0 : lView[index];
}
function hasModelInput(directiveDef, name) {
  return hasInput(directiveDef, name) && hasOutput(directiveDef, name + "Change");
}
function hasInput(directiveDef, name) {
  return name in directiveDef.inputs;
}
function hasOutput(directiveDef, name) {
  return name in directiveDef.outputs;
}
function initializeCustomControl(lView, tNode, fieldDirective, modelName) {
  const tView = getTView();
  const directiveIndex = tNode.customControlIndex;
  const outputName = modelName + "Change";
  listenToOutput(tNode, lView, directiveIndex, outputName, outputName, wrapListener(tNode, lView, (value) => fieldDirective.state().setControlValue(value)));
  const directiveDef = tView.data[directiveIndex];
  const touchedOutputName = "touchedChange";
  if (hasOutput(directiveDef, touchedOutputName)) {
    listenToOutput(tNode, lView, directiveIndex, touchedOutputName, touchedOutputName, wrapListener(tNode, lView, () => fieldDirective.state().markAsTouched()));
  }
}
function initializeInteropControl(fieldDirective) {
  const interopControl = fieldDirective.ɵinteropControl;
  interopControl.registerOnChange((value) => fieldDirective.state().setControlValue(value));
  interopControl.registerOnTouched(() => fieldDirective.state().markAsTouched());
}
function isNativeControl(tNode) {
  if (tNode.type !== 2) {
    return false;
  }
  const tagName = tNode.value;
  return tagName === "input" || tagName === "textarea" || tagName === "select";
}
function initializeNativeControl(lView, tNode, fieldDirective) {
  const tView = getTView();
  const renderer = lView[RENDERER];
  const element = getNativeByTNode(tNode, lView);
  const inputListener = () => {
    const state = fieldDirective.state();
    state.setControlValue(getNativeControlValue(element, state.value));
  };
  listenToDomEvent(tNode, tView, lView, void 0, renderer, "input", inputListener, wrapListener(tNode, lView, inputListener));
  const blurListener = () => {
    fieldDirective.state().markAsTouched();
  };
  listenToDomEvent(tNode, tView, lView, void 0, renderer, "blur", blurListener, wrapListener(tNode, lView, blurListener));
  if (tNode.type === 2 && tNode.value === "select" && typeof MutationObserver === "function") {
    const observer = observeSelectMutations(element, fieldDirective);
    storeCleanupWithContext(tView, lView, observer, observer.disconnect);
  }
}
function observeSelectMutations(select, controlDirective) {
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => isRelevantSelectMutation(m))) {
      select.value = controlDirective.state().value();
    }
  });
  observer.observe(select, {
    attributes: true,
    attributeFilter: ["value"],
    characterData: true,
    childList: true,
    subtree: true
  });
  return observer;
}
function isRelevantSelectMutation(mutation) {
  if (mutation.type === "childList" || mutation.type === "characterData") {
    if (mutation.target instanceof Comment) {
      return false;
    }
    for (const node of mutation.addedNodes) {
      if (!(node instanceof Comment)) {
        return true;
      }
    }
    for (const node of mutation.removedNodes) {
      if (!(node instanceof Comment)) {
        return true;
      }
    }
    return false;
  }
  if (mutation.type === "attributes" && mutation.target instanceof HTMLOptionElement) {
    return true;
  }
  return false;
}
function updateControlClasses(lView, tNode, control) {
  if (control.classes) {
    const bindings = getControlBindings(lView);
    bindings.classes ??= {};
    control.state();
    const renderer = lView[RENDERER];
    const element = getNativeByTNode(tNode, lView);
    for (const [className, enabled] of control.classes) {
      const isEnabled = enabled();
      if (controlClassBindingUpdated(bindings.classes, className, isEnabled)) {
        if (isEnabled) {
          renderer.addClass(element, className);
        } else {
          renderer.removeClass(element, className);
        }
      }
    }
  }
}
function updateCustomControl(tNode, lView, control, modelName) {
  const tView = getTView();
  const directiveIndex = tNode.customControlIndex;
  const directive = lView[directiveIndex];
  const directiveDef = tView.data[directiveIndex];
  const state = control.state();
  const bindings = getControlBindings(lView);
  const controlValue = state.controlValue();
  if (controlBindingUpdated(bindings, CONTROL_VALUE, controlValue)) {
    writeToDirectiveInput(directiveDef, directive, modelName, controlValue);
  }
  const isNative = (tNode.flags & 8192) !== 0;
  const element = isNative ? getNativeByTNode(tNode, lView) : null;
  const renderer = lView[RENDERER];
  for (const key of CONTROL_BINDING_KEYS) {
    const value = state[key]?.();
    if (controlBindingUpdated(bindings, key, value)) {
      const inputName = CONTROL_BINDING_NAMES[key];
      updateDirectiveInputs(tNode, lView, inputName, value);
      if (isNative && !(inputName in directiveDef.inputs)) {
        updateNativeProperty(tNode, renderer, element, key, value, inputName);
      }
    }
  }
}
function updateInteropControl(tNode, lView, control) {
  const interopControl = control.ɵinteropControl;
  const bindings = getControlBindings(lView);
  const state = control.state();
  const isNative = (tNode.flags & 8192) !== 0;
  const element = isNative ? getNativeByTNode(tNode, lView) : null;
  const renderer = lView[RENDERER];
  const value = state.value();
  if (controlBindingUpdated(bindings, CONTROL_VALUE, value)) {
    untracked(() => interopControl.writeValue(value));
  }
  for (const key of CONTROL_BINDING_KEYS) {
    const value2 = state[key]?.();
    if (controlBindingUpdated(bindings, key, value2)) {
      const inputName = CONTROL_BINDING_NAMES[key];
      const didUpdateInput = updateDirectiveInputs(tNode, lView, inputName, value2);
      if (key === DISABLED) {
        if (interopControl.setDisabledState) {
          untracked(() => interopControl.setDisabledState(value2));
        }
      } else if (isNative && !didUpdateInput) {
        updateNativeProperty(tNode, renderer, element, key, value2, inputName);
      }
    }
  }
}
function updateNativeControl(tNode, lView, control) {
  const element = getNativeByTNode(tNode, lView);
  const renderer = lView[RENDERER];
  const state = control.state();
  const bindings = getControlBindings(lView);
  const controlValue = state.controlValue();
  if (controlBindingUpdated(bindings, CONTROL_VALUE, controlValue)) {
    setNativeControlValue(element, controlValue);
  }
  for (const key of CONTROL_BINDING_KEYS) {
    const value = state[key]?.();
    if (controlBindingUpdated(bindings, key, value)) {
      const inputName = CONTROL_BINDING_NAMES[key];
      updateNativeProperty(tNode, renderer, element, key, value, inputName);
      updateDirectiveInputs(tNode, lView, inputName, value);
    }
  }
}
function updateDirectiveInputs(tNode, lView, inputName, value) {
  const directiveIndices = tNode.inputs?.[inputName];
  if (directiveIndices) {
    const tView = getTView();
    for (const index of directiveIndices) {
      const directiveDef = tView.data[index];
      const directive = lView[index];
      writeToDirectiveInput(directiveDef, directive, inputName, value);
    }
    return true;
  }
  return false;
}
function updateNativeProperty(tNode, renderer, element, key, value, name) {
  switch (key) {
    case NAME:
      renderer.setAttribute(element, name, value);
      break;
    case DISABLED:
    case READONLY:
    case REQUIRED:
      setBooleanAttribute(renderer, element, name, value);
      break;
    case MAX:
    case MIN:
      if (tNode.flags & 16384) {
        setOptionalAttribute(renderer, element, name, value);
      }
      break;
    case MAX_LENGTH:
    case MIN_LENGTH:
      if (tNode.flags & 32768) {
        setOptionalAttribute(renderer, element, name, value);
      }
      break;
  }
}
function isDateOrNull(value) {
  return value === null || value instanceof Date;
}
function isNumericInput(tNode) {
  if (!tNode.attrs || tNode.value !== "input") {
    return false;
  }
  for (let i = 0; i < tNode.attrs.length; i += 2) {
    const name = tNode.attrs[i];
    if (isNameOnlyAttributeMarker(name)) {
      break;
    }
    if (name === "type") {
      const value = tNode.attrs[i + 1];
      return value === "date" || value === "datetime-local" || value === "month" || value === "number" || value === "range" || value === "time" || value === "week";
    }
  }
  return false;
}
function isTextControl(tNode) {
  return tNode.value !== "select";
}
function getNativeControlValue(element, currentValue) {
  switch (element.type) {
    case "checkbox":
      return element.checked;
    case "number":
    case "range":
    case "datetime-local":
      if (typeof currentValue() === "number") {
        return element.valueAsNumber;
      }
      break;
    case "date":
    case "month":
    case "time":
    case "week":
      const value = currentValue();
      if (isDateOrNull(value)) {
        return element.valueAsDate;
      } else if (typeof value === "number") {
        return element.valueAsNumber;
      }
      break;
  }
  return element.value;
}
function setNativeControlValue(element, value) {
  switch (element.type) {
    case "checkbox":
      element.checked = value;
      return;
    case "radio":
      element.checked = value === element.value;
      return;
    case "number":
    case "range":
    case "datetime-local":
      if (typeof value === "number") {
        setNativeNumberControlValue(element, value);
        return;
      }
      break;
    case "date":
    case "month":
    case "time":
    case "week":
      if (isDateOrNull(value)) {
        element.valueAsDate = value;
        return;
      } else if (typeof value === "number") {
        setNativeNumberControlValue(element, value);
        return;
      }
  }
  element.value = value;
}
function setNativeNumberControlValue(element, value) {
  if (isNaN(value)) {
    element.value = "";
  } else {
    element.valueAsNumber = value;
  }
}
var DISABLED = getClosureSafeProperty({
  disabled: getClosureSafeProperty
});
var MAX = getClosureSafeProperty({
  max: getClosureSafeProperty
});
var MAX_LENGTH = getClosureSafeProperty({
  maxLength: getClosureSafeProperty
});
var MIN = getClosureSafeProperty({
  min: getClosureSafeProperty
});
var MIN_LENGTH = getClosureSafeProperty({
  minLength: getClosureSafeProperty
});
var NAME = getClosureSafeProperty({
  name: getClosureSafeProperty
});
var READONLY = getClosureSafeProperty({
  readonly: getClosureSafeProperty
});
var REQUIRED = getClosureSafeProperty({
  required: getClosureSafeProperty
});
var CONTROL_VALUE = getClosureSafeProperty({
  controlValue: getClosureSafeProperty
});
var CONTROL_BINDING_NAMES = {
  disabled: "disabled",
  disabledReasons: "disabledReasons",
  dirty: "dirty",
  errors: "errors",
  hidden: "hidden",
  invalid: "invalid",
  max: "max",
  maxLength: "maxLength",
  min: "min",
  minLength: "minLength",
  name: "name",
  pattern: "pattern",
  pending: "pending",
  readonly: "readonly",
  required: "required",
  touched: "touched"
};
var CONTROL_BINDING_KEYS = (() => Object.keys(CONTROL_BINDING_NAMES))();
function getControlBindings(lView) {
  const bindingIndex = getBindingIndex();
  let bindings = lView[bindingIndex];
  if (bindings === NO_CHANGE) {
    bindings = lView[bindingIndex] = {};
  }
  return bindings;
}
function controlBindingUpdated(bindings, key, value) {
  const oldValue = bindings[key];
  if (Object.is(oldValue, value)) {
    return false;
  }
  bindings[key] = value;
  return true;
}
function controlClassBindingUpdated(bindings, className, value) {
  const oldValue = bindings[className];
  if (Object.is(oldValue, value)) {
    return false;
  }
  bindings[className] = value;
  return true;
}
function setBooleanAttribute(renderer, element, name, value) {
  if (value) {
    renderer.setAttribute(element, name, "");
  } else {
    renderer.removeAttribute(element, name);
  }
}
function setOptionalAttribute(renderer, element, name, value) {
  if (value !== void 0) {
    renderer.setAttribute(element, name, value.toString());
  } else {
    renderer.removeAttribute(element, name);
  }
}
var LiveCollection = class {
  destroy(item) {
  }
  updateValue(index, value) {
  }
  swap(index1, index2) {
    const startIdx = Math.min(index1, index2);
    const endIdx = Math.max(index1, index2);
    const endItem = this.detach(endIdx);
    if (endIdx - startIdx > 1) {
      const startItem = this.detach(startIdx);
      this.attach(startIdx, endItem);
      this.attach(endIdx, startItem);
    } else {
      this.attach(startIdx, endItem);
    }
  }
  move(prevIndex, newIdx) {
    this.attach(newIdx, this.detach(prevIndex));
  }
};
function valuesMatching(liveIdx, liveValue, newIdx, newValue, trackBy) {
  if (liveIdx === newIdx && Object.is(liveValue, newValue)) {
    return 1;
  } else if (Object.is(trackBy(liveIdx, liveValue), trackBy(newIdx, newValue))) {
    return -1;
  }
  return 0;
}
function recordDuplicateKeys(keyToIdx, key, idx) {
  const idxSoFar = keyToIdx.get(key);
  if (idxSoFar !== void 0) {
    idxSoFar.add(idx);
  } else {
    keyToIdx.set(key, /* @__PURE__ */ new Set([idx]));
  }
}
function reconcile(liveCollection, newCollection, trackByFn, reactiveConsumer) {
  let detachedItems = void 0;
  let liveKeysInTheFuture = void 0;
  let liveStartIdx = 0;
  let liveEndIdx = liveCollection.length - 1;
  const duplicateKeys = ngDevMode ? /* @__PURE__ */ new Map() : void 0;
  if (Array.isArray(newCollection)) {
    setActiveConsumer(reactiveConsumer);
    let newEndIdx = newCollection.length - 1;
    setActiveConsumer(null);
    while (liveStartIdx <= liveEndIdx && liveStartIdx <= newEndIdx) {
      const liveStartValue = liveCollection.at(liveStartIdx);
      const newStartValue = newCollection[liveStartIdx];
      if (ngDevMode) {
        recordDuplicateKeys(duplicateKeys, trackByFn(liveStartIdx, newStartValue), liveStartIdx);
      }
      const isStartMatching = valuesMatching(liveStartIdx, liveStartValue, liveStartIdx, newStartValue, trackByFn);
      if (isStartMatching !== 0) {
        if (isStartMatching < 0) {
          liveCollection.updateValue(liveStartIdx, newStartValue);
        }
        liveStartIdx++;
        continue;
      }
      const liveEndValue = liveCollection.at(liveEndIdx);
      const newEndValue = newCollection[newEndIdx];
      if (ngDevMode) {
        recordDuplicateKeys(duplicateKeys, trackByFn(newEndIdx, newEndValue), newEndIdx);
      }
      const isEndMatching = valuesMatching(liveEndIdx, liveEndValue, newEndIdx, newEndValue, trackByFn);
      if (isEndMatching !== 0) {
        if (isEndMatching < 0) {
          liveCollection.updateValue(liveEndIdx, newEndValue);
        }
        liveEndIdx--;
        newEndIdx--;
        continue;
      }
      const liveStartKey = trackByFn(liveStartIdx, liveStartValue);
      const liveEndKey = trackByFn(liveEndIdx, liveEndValue);
      const newStartKey = trackByFn(liveStartIdx, newStartValue);
      if (Object.is(newStartKey, liveEndKey)) {
        const newEndKey = trackByFn(newEndIdx, newEndValue);
        if (Object.is(newEndKey, liveStartKey)) {
          liveCollection.swap(liveStartIdx, liveEndIdx);
          liveCollection.updateValue(liveEndIdx, newEndValue);
          newEndIdx--;
          liveEndIdx--;
        } else {
          liveCollection.move(liveEndIdx, liveStartIdx);
        }
        liveCollection.updateValue(liveStartIdx, newStartValue);
        liveStartIdx++;
        continue;
      }
      detachedItems ??= new UniqueValueMultiKeyMap();
      liveKeysInTheFuture ??= initLiveItemsInTheFuture(liveCollection, liveStartIdx, liveEndIdx, trackByFn);
      if (attachPreviouslyDetached(liveCollection, detachedItems, liveStartIdx, newStartKey)) {
        liveCollection.updateValue(liveStartIdx, newStartValue);
        liveStartIdx++;
        liveEndIdx++;
      } else if (!liveKeysInTheFuture.has(newStartKey)) {
        const newItem = liveCollection.create(liveStartIdx, newCollection[liveStartIdx]);
        liveCollection.attach(liveStartIdx, newItem);
        liveStartIdx++;
        liveEndIdx++;
      } else {
        detachedItems.set(liveStartKey, liveCollection.detach(liveStartIdx));
        liveEndIdx--;
      }
    }
    while (liveStartIdx <= newEndIdx) {
      createOrAttach(liveCollection, detachedItems, trackByFn, liveStartIdx, newCollection[liveStartIdx]);
      liveStartIdx++;
    }
  } else if (newCollection != null) {
    setActiveConsumer(reactiveConsumer);
    const newCollectionIterator = newCollection[Symbol.iterator]();
    setActiveConsumer(null);
    let newIterationResult = newCollectionIterator.next();
    while (!newIterationResult.done && liveStartIdx <= liveEndIdx) {
      const liveValue = liveCollection.at(liveStartIdx);
      const newValue = newIterationResult.value;
      if (ngDevMode) {
        recordDuplicateKeys(duplicateKeys, trackByFn(liveStartIdx, newValue), liveStartIdx);
      }
      const isStartMatching = valuesMatching(liveStartIdx, liveValue, liveStartIdx, newValue, trackByFn);
      if (isStartMatching !== 0) {
        if (isStartMatching < 0) {
          liveCollection.updateValue(liveStartIdx, newValue);
        }
        liveStartIdx++;
        newIterationResult = newCollectionIterator.next();
      } else {
        detachedItems ??= new UniqueValueMultiKeyMap();
        liveKeysInTheFuture ??= initLiveItemsInTheFuture(liveCollection, liveStartIdx, liveEndIdx, trackByFn);
        const newKey = trackByFn(liveStartIdx, newValue);
        if (attachPreviouslyDetached(liveCollection, detachedItems, liveStartIdx, newKey)) {
          liveCollection.updateValue(liveStartIdx, newValue);
          liveStartIdx++;
          liveEndIdx++;
          newIterationResult = newCollectionIterator.next();
        } else if (!liveKeysInTheFuture.has(newKey)) {
          liveCollection.attach(liveStartIdx, liveCollection.create(liveStartIdx, newValue));
          liveStartIdx++;
          liveEndIdx++;
          newIterationResult = newCollectionIterator.next();
        } else {
          const liveKey = trackByFn(liveStartIdx, liveValue);
          detachedItems.set(liveKey, liveCollection.detach(liveStartIdx));
          liveEndIdx--;
        }
      }
    }
    while (!newIterationResult.done) {
      createOrAttach(liveCollection, detachedItems, trackByFn, liveCollection.length, newIterationResult.value);
      newIterationResult = newCollectionIterator.next();
    }
  }
  while (liveStartIdx <= liveEndIdx) {
    liveCollection.destroy(liveCollection.detach(liveEndIdx--));
  }
  detachedItems?.forEach((item) => {
    liveCollection.destroy(item);
  });
  if (ngDevMode) {
    let duplicatedKeysMsg = [];
    for (const [key, idxSet] of duplicateKeys) {
      if (idxSet.size > 1) {
        const idx = [...idxSet].sort((a, b) => a - b);
        for (let i = 1; i < idx.length; i++) {
          duplicatedKeysMsg.push(`key "${stringifyForError(key)}" at index "${idx[i - 1]}" and "${idx[i]}"`);
        }
      }
    }
    if (duplicatedKeysMsg.length > 0) {
      const message = formatRuntimeError(-955, "The provided track expression resulted in duplicated keys for a given collection. Adjust the tracking expression such that it uniquely identifies all the items in the collection. Duplicated keys were: \n" + duplicatedKeysMsg.join(", \n") + ".");
      console.warn(message);
    }
  }
}
function attachPreviouslyDetached(prevCollection, detachedItems, index, key) {
  if (detachedItems !== void 0 && detachedItems.has(key)) {
    prevCollection.attach(index, detachedItems.get(key));
    detachedItems.delete(key);
    return true;
  }
  return false;
}
function createOrAttach(liveCollection, detachedItems, trackByFn, index, value) {
  if (!attachPreviouslyDetached(liveCollection, detachedItems, index, trackByFn(index, value))) {
    const newItem = liveCollection.create(index, value);
    liveCollection.attach(index, newItem);
  } else {
    liveCollection.updateValue(index, value);
  }
}
function initLiveItemsInTheFuture(liveCollection, start, end, trackByFn) {
  const keys = /* @__PURE__ */ new Set();
  for (let i = start; i <= end; i++) {
    keys.add(trackByFn(i, liveCollection.at(i)));
  }
  return keys;
}
var UniqueValueMultiKeyMap = class {
  kvMap = /* @__PURE__ */ new Map();
  _vMap = void 0;
  has(key) {
    return this.kvMap.has(key);
  }
  delete(key) {
    if (!this.has(key)) return false;
    const value = this.kvMap.get(key);
    if (this._vMap !== void 0 && this._vMap.has(value)) {
      this.kvMap.set(key, this._vMap.get(value));
      this._vMap.delete(value);
    } else {
      this.kvMap.delete(key);
    }
    return true;
  }
  get(key) {
    return this.kvMap.get(key);
  }
  set(key, value) {
    if (this.kvMap.has(key)) {
      let prevValue = this.kvMap.get(key);
      if (ngDevMode && prevValue === value) {
        throw new Error(`Detected a duplicated value ${value} for the key ${key}`);
      }
      if (this._vMap === void 0) {
        this._vMap = /* @__PURE__ */ new Map();
      }
      const vMap = this._vMap;
      while (vMap.has(prevValue)) {
        prevValue = vMap.get(prevValue);
      }
      vMap.set(prevValue, value);
    } else {
      this.kvMap.set(key, value);
    }
  }
  forEach(cb) {
    for (let [key, value] of this.kvMap) {
      cb(value, key);
      if (this._vMap !== void 0) {
        const vMap = this._vMap;
        while (vMap.has(value)) {
          value = vMap.get(value);
          cb(value, key);
        }
      }
    }
  }
};
function ɵɵconditionalCreate(index, templateFn, decls, vars, tagName, attrsIndex, localRefsIndex, localRefExtractor) {
  performanceMarkFeature("NgControlFlow");
  const lView = getLView();
  const tView = getTView();
  const attrs = getConstant(tView.consts, attrsIndex);
  declareNoDirectiveHostTemplate(lView, tView, index, templateFn, decls, vars, tagName, attrs, 256, localRefsIndex, localRefExtractor);
  return ɵɵconditionalBranchCreate;
}
function ɵɵconditionalBranchCreate(index, templateFn, decls, vars, tagName, attrsIndex, localRefsIndex, localRefExtractor) {
  performanceMarkFeature("NgControlFlow");
  const lView = getLView();
  const tView = getTView();
  const attrs = getConstant(tView.consts, attrsIndex);
  declareNoDirectiveHostTemplate(lView, tView, index, templateFn, decls, vars, tagName, attrs, 512, localRefsIndex, localRefExtractor);
  return ɵɵconditionalBranchCreate;
}
function ɵɵconditional(matchingTemplateIndex, contextValue) {
  performanceMarkFeature("NgControlFlow");
  const hostLView = getLView();
  const bindingIndex = nextBindingIndex();
  const prevMatchingTemplateIndex = hostLView[bindingIndex] !== NO_CHANGE ? hostLView[bindingIndex] : -1;
  const prevContainer = prevMatchingTemplateIndex !== -1 ? getLContainer(hostLView, HEADER_OFFSET + prevMatchingTemplateIndex) : void 0;
  const viewInContainerIdx = 0;
  if (bindingUpdated(hostLView, bindingIndex, matchingTemplateIndex)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      if (prevContainer !== void 0) {
        removeLViewFromLContainer(prevContainer, viewInContainerIdx);
      }
      if (matchingTemplateIndex !== -1) {
        const nextLContainerIndex = HEADER_OFFSET + matchingTemplateIndex;
        const nextContainer = getLContainer(hostLView, nextLContainerIndex);
        const templateTNode = getExistingTNode(hostLView[TVIEW], nextLContainerIndex);
        const dehydratedView = findAndReconcileMatchingDehydratedViews(nextContainer, templateTNode, hostLView);
        const embeddedLView = createAndRenderEmbeddedLView(hostLView, templateTNode, contextValue, {
          dehydratedView
        });
        addLViewToLContainer(nextContainer, embeddedLView, viewInContainerIdx, shouldAddViewToDom(templateTNode, dehydratedView));
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  } else if (prevContainer !== void 0) {
    const lView = getLViewFromLContainer(prevContainer, viewInContainerIdx);
    if (lView !== void 0) {
      lView[CONTEXT] = contextValue;
    }
  }
}
var RepeaterContext = class {
  lContainer;
  $implicit;
  $index;
  constructor(lContainer, $implicit, $index) {
    this.lContainer = lContainer;
    this.$implicit = $implicit;
    this.$index = $index;
  }
  get $count() {
    return this.lContainer.length - CONTAINER_HEADER_OFFSET;
  }
};
function ɵɵrepeaterTrackByIndex(index) {
  return index;
}
function ɵɵrepeaterTrackByIdentity(_, value) {
  return value;
}
var RepeaterMetadata = class {
  hasEmptyBlock;
  trackByFn;
  liveCollection;
  constructor(hasEmptyBlock, trackByFn, liveCollection) {
    this.hasEmptyBlock = hasEmptyBlock;
    this.trackByFn = trackByFn;
    this.liveCollection = liveCollection;
  }
};
function ɵɵrepeaterCreate(index, templateFn, decls, vars, tagName, attrsIndex, trackByFn, trackByUsesComponentInstance, emptyTemplateFn, emptyDecls, emptyVars, emptyTagName, emptyAttrsIndex) {
  performanceMarkFeature("NgControlFlow");
  ngDevMode && assertFunction(trackByFn, `A track expression must be a function, was ${typeof trackByFn} instead.`);
  const lView = getLView();
  const tView = getTView();
  const hasEmptyBlock = emptyTemplateFn !== void 0;
  const hostLView = getLView();
  const boundTrackBy = trackByUsesComponentInstance ? trackByFn.bind(hostLView[DECLARATION_COMPONENT_VIEW][CONTEXT]) : trackByFn;
  const metadata = new RepeaterMetadata(hasEmptyBlock, boundTrackBy);
  hostLView[HEADER_OFFSET + index] = metadata;
  declareNoDirectiveHostTemplate(lView, tView, index + 1, templateFn, decls, vars, tagName, getConstant(tView.consts, attrsIndex), 256);
  if (hasEmptyBlock) {
    ngDevMode && assertDefined(emptyDecls, "Missing number of declarations for the empty repeater block.");
    ngDevMode && assertDefined(emptyVars, "Missing number of bindings for the empty repeater block.");
    declareNoDirectiveHostTemplate(lView, tView, index + 2, emptyTemplateFn, emptyDecls, emptyVars, emptyTagName, getConstant(tView.consts, emptyAttrsIndex), 512);
  }
}
function isViewExpensiveToRecreate(lView) {
  return lView.length - HEADER_OFFSET > 2;
}
var OperationsCounter = class {
  created = 0;
  destroyed = 0;
  reset() {
    this.created = 0;
    this.destroyed = 0;
  }
  recordCreate() {
    this.created++;
  }
  recordDestroy() {
    this.destroyed++;
  }
  wasReCreated(collectionLen) {
    return collectionLen > 0 && this.created === this.destroyed && this.created === collectionLen;
  }
};
var LiveCollectionLContainerImpl = class extends LiveCollection {
  lContainer;
  hostLView;
  templateTNode;
  operationsCounter = ngDevMode ? new OperationsCounter() : void 0;
  needsIndexUpdate = false;
  constructor(lContainer, hostLView, templateTNode) {
    super();
    this.lContainer = lContainer;
    this.hostLView = hostLView;
    this.templateTNode = templateTNode;
  }
  get length() {
    return this.lContainer.length - CONTAINER_HEADER_OFFSET;
  }
  at(index) {
    return this.getLView(index)[CONTEXT].$implicit;
  }
  attach(index, lView) {
    const dehydratedView = lView[HYDRATION];
    this.needsIndexUpdate ||= index !== this.length;
    addLViewToLContainer(this.lContainer, lView, index, shouldAddViewToDom(this.templateTNode, dehydratedView));
    clearDetachAnimationList(this.lContainer, index);
  }
  detach(index) {
    this.needsIndexUpdate ||= index !== this.length - 1;
    maybeInitDetachAnimationList(this.lContainer, index);
    return detachExistingView(this.lContainer, index);
  }
  create(index, value) {
    const dehydratedView = findMatchingDehydratedView(this.lContainer, this.templateTNode.tView.ssrId);
    const embeddedLView = createAndRenderEmbeddedLView(this.hostLView, this.templateTNode, new RepeaterContext(this.lContainer, value, index), {
      dehydratedView
    });
    ngDevMode && this.operationsCounter?.recordCreate();
    return embeddedLView;
  }
  destroy(lView) {
    destroyLView(lView[TVIEW], lView);
    ngDevMode && this.operationsCounter?.recordDestroy();
  }
  updateValue(index, value) {
    this.getLView(index)[CONTEXT].$implicit = value;
  }
  reset() {
    this.needsIndexUpdate = false;
    ngDevMode && this.operationsCounter?.reset();
  }
  updateIndexes() {
    if (this.needsIndexUpdate) {
      for (let i = 0; i < this.length; i++) {
        this.getLView(i)[CONTEXT].$index = i;
      }
    }
  }
  getLView(index) {
    return getExistingLViewFromLContainer(this.lContainer, index);
  }
};
function ɵɵrepeater(collection) {
  const prevConsumer = setActiveConsumer(null);
  const metadataSlotIdx = getSelectedIndex();
  try {
    const hostLView = getLView();
    const hostTView = hostLView[TVIEW];
    const metadata = hostLView[metadataSlotIdx];
    const containerIndex = metadataSlotIdx + 1;
    const lContainer = getLContainer(hostLView, containerIndex);
    if (metadata.liveCollection === void 0) {
      const itemTemplateTNode = getExistingTNode(hostTView, containerIndex);
      metadata.liveCollection = new LiveCollectionLContainerImpl(lContainer, hostLView, itemTemplateTNode);
    } else {
      metadata.liveCollection.reset();
    }
    const liveCollection = metadata.liveCollection;
    reconcile(liveCollection, collection, metadata.trackByFn, prevConsumer);
    if (ngDevMode && metadata.trackByFn === ɵɵrepeaterTrackByIdentity && liveCollection.operationsCounter?.wasReCreated(liveCollection.length) && isViewExpensiveToRecreate(getExistingLViewFromLContainer(lContainer, 0))) {
      const message = formatRuntimeError(-956, `The configured tracking expression (track by identity) caused re-creation of the entire collection of size ${liveCollection.length}. This is an expensive operation requiring destruction and subsequent creation of DOM nodes, directives, components etc. Please review the "track expression" and make sure that it uniquely identifies items in a collection.`);
      console.warn(message);
    }
    liveCollection.updateIndexes();
    if (metadata.hasEmptyBlock) {
      const bindingIndex = nextBindingIndex();
      const isCollectionEmpty = liveCollection.length === 0;
      if (bindingUpdated(hostLView, bindingIndex, isCollectionEmpty)) {
        const emptyTemplateIndex = metadataSlotIdx + 2;
        const lContainerForEmpty = getLContainer(hostLView, emptyTemplateIndex);
        if (isCollectionEmpty) {
          const emptyTemplateTNode = getExistingTNode(hostTView, emptyTemplateIndex);
          const dehydratedView = findAndReconcileMatchingDehydratedViews(lContainerForEmpty, emptyTemplateTNode, hostLView);
          const embeddedLView = createAndRenderEmbeddedLView(hostLView, emptyTemplateTNode, void 0, {
            dehydratedView
          });
          addLViewToLContainer(lContainerForEmpty, embeddedLView, 0, shouldAddViewToDom(emptyTemplateTNode, dehydratedView));
        } else {
          if (hostTView.firstUpdatePass) {
            removeDehydratedViews(lContainerForEmpty);
          }
          removeLViewFromLContainer(lContainerForEmpty, 0);
        }
      }
    }
  } finally {
    setActiveConsumer(prevConsumer);
  }
}
function getLContainer(lView, index) {
  const lContainer = lView[index];
  ngDevMode && assertLContainer(lContainer);
  return lContainer;
}
function clearDetachAnimationList(lContainer, index) {
  if (lContainer.length <= CONTAINER_HEADER_OFFSET) return;
  const indexInContainer = CONTAINER_HEADER_OFFSET + index;
  const viewToDetach = lContainer[indexInContainer];
  const animations = viewToDetach ? viewToDetach[ANIMATIONS] : void 0;
  if (viewToDetach && animations && animations.detachedLeaveAnimationFns && animations.detachedLeaveAnimationFns.length > 0) {
    const injector = viewToDetach[INJECTOR];
    removeFromAnimationQueue(injector, animations);
    allLeavingAnimations.delete(viewToDetach[ID]);
    animations.detachedLeaveAnimationFns = void 0;
  }
}
function maybeInitDetachAnimationList(lContainer, index) {
  if (lContainer.length <= CONTAINER_HEADER_OFFSET) return;
  const indexInContainer = CONTAINER_HEADER_OFFSET + index;
  const viewToDetach = lContainer[indexInContainer];
  const animations = viewToDetach ? viewToDetach[ANIMATIONS] : void 0;
  if (animations && animations.leave && animations.leave.size > 0) {
    animations.detachedLeaveAnimationFns = [];
  }
}
function detachExistingView(lContainer, index) {
  const existingLView = detachView(lContainer, index);
  ngDevMode && assertLView(existingLView);
  return existingLView;
}
function getExistingLViewFromLContainer(lContainer, index) {
  const existingLView = getLViewFromLContainer(lContainer, index);
  ngDevMode && assertLView(existingLView);
  return existingLView;
}
function getExistingTNode(tView, index) {
  const tNode = getTNode(tView, index);
  ngDevMode && assertTNode(tNode);
  return tNode;
}
function ɵɵproperty(propName, value, sanitizer) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    setPropertyAndInputs(tNode, lView, propName, value, lView[RENDERER], sanitizer);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
  }
  return ɵɵproperty;
}
function setDirectiveInputsWhichShadowsStyling(tView, tNode, lView, value, isClassBased) {
  setAllInputsForProperty(tNode, tView, lView, isClassBased ? "class" : "style", value);
}
function ɵɵelementStart(index, name, attrsIndex, localRefsIndex) {
  const lView = getLView();
  ngDevMode && assertTNodeCreationIndex(lView, index);
  const tView = lView[TVIEW];
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = tView.firstCreatePass ? directiveHostFirstCreatePass(adjustedIndex, lView, 2, name, findDirectiveDefMatches, getBindingsEnabled(), attrsIndex, localRefsIndex) : tView.data[adjustedIndex];
  elementLikeStartShared(tNode, lView, index, name, _locateOrCreateElementNode);
  if (isDirectiveHost(tNode)) {
    const tView2 = lView[TVIEW];
    createDirectivesInstances(tView2, lView, tNode);
    executeContentQueries(tView2, tNode, lView);
  }
  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode);
  }
  if (ngDevMode && lView[TVIEW].firstCreatePass) {
    validateElementIsKnown(lView, tNode);
  }
  return ɵɵelementStart;
}
function ɵɵelementEnd() {
  const tView = getTView();
  const initialTNode = getCurrentTNode();
  ngDevMode && assertDefined(initialTNode, "No parent node to close.");
  const currentTNode = elementLikeEndShared(initialTNode);
  ngDevMode && assertTNodeType(currentTNode, 3);
  if (tView.firstCreatePass) {
    directiveHostEndFirstCreatePass(tView, currentTNode);
  }
  if (isSkipHydrationRootTNode(currentTNode)) {
    leaveSkipHydrationBlock();
  }
  decreaseElementDepthCount();
  if (currentTNode.classesWithoutHost != null && hasClassInput(currentTNode)) {
    setDirectiveInputsWhichShadowsStyling(tView, currentTNode, getLView(), currentTNode.classesWithoutHost, true);
  }
  if (currentTNode.stylesWithoutHost != null && hasStyleInput(currentTNode)) {
    setDirectiveInputsWhichShadowsStyling(tView, currentTNode, getLView(), currentTNode.stylesWithoutHost, false);
  }
  return ɵɵelementEnd;
}
function ɵɵelement(index, name, attrsIndex, localRefsIndex) {
  ɵɵelementStart(index, name, attrsIndex, localRefsIndex);
  ɵɵelementEnd();
  return ɵɵelement;
}
function ɵɵdomElementStart(index, name, attrsIndex, localRefsIndex) {
  const lView = getLView();
  ngDevMode && assertTNodeCreationIndex(lView, index);
  const tView = lView[TVIEW];
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = tView.firstCreatePass ? domOnlyFirstCreatePass(adjustedIndex, tView, 2, name, attrsIndex, localRefsIndex) : tView.data[adjustedIndex];
  elementLikeStartShared(tNode, lView, index, name, _locateOrCreateElementNode);
  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode);
  }
  if (ngDevMode && lView[TVIEW].firstCreatePass) {
    validateElementIsKnown(lView, tNode);
  }
  return ɵɵdomElementStart;
}
function ɵɵdomElementEnd() {
  const initialTNode = getCurrentTNode();
  ngDevMode && assertDefined(initialTNode, "No parent node to close.");
  const currentTNode = elementLikeEndShared(initialTNode);
  ngDevMode && assertTNodeType(currentTNode, 3);
  if (isSkipHydrationRootTNode(currentTNode)) {
    leaveSkipHydrationBlock();
  }
  decreaseElementDepthCount();
  return ɵɵdomElementEnd;
}
function ɵɵdomElement(index, name, attrsIndex, localRefsIndex) {
  ɵɵdomElementStart(index, name, attrsIndex, localRefsIndex);
  ɵɵdomElementEnd();
  return ɵɵdomElement;
}
var _locateOrCreateElementNode = (tView, lView, tNode, name, index) => {
  lastNodeWasCreated(true);
  return createElementNode(lView[RENDERER], name, getNamespace());
};
function locateOrCreateElementNodeImpl(tView, lView, tNode, name, index) {
  const isNodeCreationMode = !canHydrateNode(lView, tNode);
  lastNodeWasCreated(isNodeCreationMode);
  if (isNodeCreationMode) {
    return createElementNode(lView[RENDERER], name, getNamespace());
  }
  const hydrationInfo = lView[HYDRATION];
  const native = locateNextRNode(hydrationInfo, tView, lView, tNode);
  ngDevMode && validateMatchingNode(native, Node.ELEMENT_NODE, name, lView, tNode);
  ngDevMode && markRNodeAsClaimedByHydration(native);
  if (getSerializedContainerViews(hydrationInfo, index)) {
    ngDevMode && validateNodeExists(native.nextSibling, lView, tNode);
    setSegmentHead(hydrationInfo, index, native.nextSibling);
  }
  if (hydrationInfo && (hasSkipHydrationAttrOnTNode(tNode) || hasSkipHydrationAttrOnRElement(native))) {
    if (isComponentHost(tNode)) {
      enterSkipHydrationBlock(tNode);
      clearElementContents(native);
      ngDevMode && markRNodeAsSkippedByHydration(native);
    } else if (ngDevMode) {
      throw invalidSkipHydrationHost(native);
    }
  }
  return native;
}
function enableLocateOrCreateElementNodeImpl() {
  _locateOrCreateElementNode = locateOrCreateElementNodeImpl;
}
function ɵɵelementContainerStart(index, attrsIndex, localRefsIndex) {
  const lView = getLView();
  ngDevMode && assertTNodeCreationIndex(lView, index);
  const tView = lView[TVIEW];
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = tView.firstCreatePass ? directiveHostFirstCreatePass(adjustedIndex, lView, 8, "ng-container", findDirectiveDefMatches, getBindingsEnabled(), attrsIndex, localRefsIndex) : tView.data[adjustedIndex];
  elementLikeStartShared(tNode, lView, index, "ng-container", _locateOrCreateElementContainerNode);
  if (isDirectiveHost(tNode)) {
    const tView2 = lView[TVIEW];
    createDirectivesInstances(tView2, lView, tNode);
    executeContentQueries(tView2, tNode, lView);
  }
  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode);
  }
  return ɵɵelementContainerStart;
}
function ɵɵelementContainerEnd() {
  const tView = getTView();
  const initialTNode = getCurrentTNode();
  ngDevMode && assertDefined(initialTNode, "No parent node to close.");
  const currentTNode = elementLikeEndShared(initialTNode);
  if (tView.firstCreatePass) {
    directiveHostEndFirstCreatePass(tView, currentTNode);
  }
  ngDevMode && assertTNodeType(currentTNode, 8);
  return ɵɵelementContainerEnd;
}
function ɵɵelementContainer(index, attrsIndex, localRefsIndex) {
  ɵɵelementContainerStart(index, attrsIndex, localRefsIndex);
  ɵɵelementContainerEnd();
  return ɵɵelementContainer;
}
function ɵɵdomElementContainerStart(index, attrsIndex, localRefsIndex) {
  const lView = getLView();
  ngDevMode && assertTNodeCreationIndex(lView, index);
  const tView = lView[TVIEW];
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = tView.firstCreatePass ? domOnlyFirstCreatePass(adjustedIndex, tView, 8, "ng-container", attrsIndex, localRefsIndex) : tView.data[adjustedIndex];
  elementLikeStartShared(tNode, lView, index, "ng-container", _locateOrCreateElementContainerNode);
  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode);
  }
  return ɵɵdomElementContainerStart;
}
function ɵɵdomElementContainerEnd() {
  const initialTNode = getCurrentTNode();
  ngDevMode && assertDefined(initialTNode, "No parent node to close.");
  const currentTNode = elementLikeEndShared(initialTNode);
  ngDevMode && assertTNodeType(currentTNode, 8);
  return ɵɵelementContainerEnd;
}
function ɵɵdomElementContainer(index, attrsIndex, localRefsIndex) {
  ɵɵdomElementContainerStart(index, attrsIndex, localRefsIndex);
  ɵɵdomElementContainerEnd();
  return ɵɵdomElementContainer;
}
var _locateOrCreateElementContainerNode = (tView, lView, tNode, commentText, index) => {
  lastNodeWasCreated(true);
  return createCommentNode(lView[RENDERER], ngDevMode ? commentText : "");
};
function locateOrCreateElementContainerNode(tView, lView, tNode, commentText, index) {
  let comment;
  const isNodeCreationMode = !canHydrateNode(lView, tNode);
  lastNodeWasCreated(isNodeCreationMode);
  if (isNodeCreationMode) {
    return createCommentNode(lView[RENDERER], ngDevMode ? commentText : "");
  }
  const hydrationInfo = lView[HYDRATION];
  const currentRNode = locateNextRNode(hydrationInfo, tView, lView, tNode);
  ngDevMode && validateNodeExists(currentRNode, lView, tNode);
  const ngContainerSize = getNgContainerSize(hydrationInfo, index);
  ngDevMode && assertNumber(ngContainerSize, "Unexpected state: hydrating an <ng-container>, but no hydration info is available.");
  setSegmentHead(hydrationInfo, index, currentRNode);
  comment = siblingAfter(ngContainerSize, currentRNode);
  if (ngDevMode) {
    validateMatchingNode(comment, Node.COMMENT_NODE, null, lView, tNode);
    markRNodeAsClaimedByHydration(comment);
  }
  return comment;
}
function enableLocateOrCreateElementContainerNodeImpl() {
  _locateOrCreateElementContainerNode = locateOrCreateElementContainerNode;
}
function ɵɵgetCurrentView() {
  return getLView();
}
function ɵɵdomProperty(propName, value, sanitizer) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    setDomProperty(tNode, lView, propName, value, lView[RENDERER], sanitizer);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
  }
  return ɵɵdomProperty;
}
function ɵɵsyntheticHostProperty(propName, value, sanitizer) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    const currentDef = getCurrentDirectiveDef(tView.data);
    const renderer = loadComponentRenderer(currentDef, tNode, lView);
    setDomProperty(tNode, lView, propName, value, renderer, sanitizer);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
  }
  return ɵɵsyntheticHostProperty;
}
var u = void 0;
function plural(val) {
  const i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, "").length;
  if (i === 1 && v === 0) return 1;
  return 5;
}
var localeEn = ["en", [["a", "p"], ["AM", "PM"]], [["AM", "PM"]], [["S", "M", "T", "W", "T", "F", "S"], ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]], u, [["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]], u, [["B", "A"], ["BC", "AD"], ["Before Christ", "Anno Domini"]], 0, [6, 0], ["M/d/yy", "MMM d, y", "MMMM d, y", "EEEE, MMMM d, y"], ["h:mm a", "h:mm:ss a", "h:mm:ss a z", "h:mm:ss a zzzz"], ["{1}, {0}", u, u, u], [".", ",", ";", "%", "+", "-", "E", "×", "‰", "∞", "NaN", ":"], ["#,##0.###", "#,##0%", "¤#,##0.00", "#E0"], "USD", "$", "US Dollar", {}, "ltr", plural];
var LOCALE_DATA = {};
function registerLocaleData(data, localeId, extraData) {
  if (typeof localeId !== "string") {
    extraData = localeId;
    localeId = data[LocaleDataIndex.LocaleId];
  }
  localeId = localeId.toLowerCase().replace(/_/g, "-");
  LOCALE_DATA[localeId] = data;
  if (extraData) {
    LOCALE_DATA[localeId][LocaleDataIndex.ExtraData] = extraData;
  }
}
function findLocaleData(locale) {
  const normalizedLocale = normalizeLocale(locale);
  let match = getLocaleData(normalizedLocale);
  if (match) {
    return match;
  }
  const parentLocale = normalizedLocale.split("-")[0];
  match = getLocaleData(parentLocale);
  if (match) {
    return match;
  }
  if (parentLocale === "en") {
    return localeEn;
  }
  throw new RuntimeError(701, ngDevMode && `Missing locale data for the locale "${locale}".`);
}
function getLocaleCurrencyCode(locale) {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.CurrencyCode] || null;
}
function getLocalePluralCase(locale) {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.PluralCase];
}
function getLocaleData(normalizedLocale) {
  if (!(normalizedLocale in LOCALE_DATA)) {
    LOCALE_DATA[normalizedLocale] = _global.ng && _global.ng.common && _global.ng.common.locales && _global.ng.common.locales[normalizedLocale];
  }
  return LOCALE_DATA[normalizedLocale];
}
function unregisterAllLocaleData() {
  LOCALE_DATA = {};
}
var LocaleDataIndex;
(function(LocaleDataIndex2) {
  LocaleDataIndex2[LocaleDataIndex2["LocaleId"] = 0] = "LocaleId";
  LocaleDataIndex2[LocaleDataIndex2["DayPeriodsFormat"] = 1] = "DayPeriodsFormat";
  LocaleDataIndex2[LocaleDataIndex2["DayPeriodsStandalone"] = 2] = "DayPeriodsStandalone";
  LocaleDataIndex2[LocaleDataIndex2["DaysFormat"] = 3] = "DaysFormat";
  LocaleDataIndex2[LocaleDataIndex2["DaysStandalone"] = 4] = "DaysStandalone";
  LocaleDataIndex2[LocaleDataIndex2["MonthsFormat"] = 5] = "MonthsFormat";
  LocaleDataIndex2[LocaleDataIndex2["MonthsStandalone"] = 6] = "MonthsStandalone";
  LocaleDataIndex2[LocaleDataIndex2["Eras"] = 7] = "Eras";
  LocaleDataIndex2[LocaleDataIndex2["FirstDayOfWeek"] = 8] = "FirstDayOfWeek";
  LocaleDataIndex2[LocaleDataIndex2["WeekendRange"] = 9] = "WeekendRange";
  LocaleDataIndex2[LocaleDataIndex2["DateFormat"] = 10] = "DateFormat";
  LocaleDataIndex2[LocaleDataIndex2["TimeFormat"] = 11] = "TimeFormat";
  LocaleDataIndex2[LocaleDataIndex2["DateTimeFormat"] = 12] = "DateTimeFormat";
  LocaleDataIndex2[LocaleDataIndex2["NumberSymbols"] = 13] = "NumberSymbols";
  LocaleDataIndex2[LocaleDataIndex2["NumberFormats"] = 14] = "NumberFormats";
  LocaleDataIndex2[LocaleDataIndex2["CurrencyCode"] = 15] = "CurrencyCode";
  LocaleDataIndex2[LocaleDataIndex2["CurrencySymbol"] = 16] = "CurrencySymbol";
  LocaleDataIndex2[LocaleDataIndex2["CurrencyName"] = 17] = "CurrencyName";
  LocaleDataIndex2[LocaleDataIndex2["Currencies"] = 18] = "Currencies";
  LocaleDataIndex2[LocaleDataIndex2["Directionality"] = 19] = "Directionality";
  LocaleDataIndex2[LocaleDataIndex2["PluralCase"] = 20] = "PluralCase";
  LocaleDataIndex2[LocaleDataIndex2["ExtraData"] = 21] = "ExtraData";
})(LocaleDataIndex || (LocaleDataIndex = {}));
function normalizeLocale(locale) {
  return locale.toLowerCase().replace(/_/g, "-");
}
var pluralMapping = ["zero", "one", "two", "few", "many"];
function getPluralCase(value, locale) {
  const plural2 = getLocalePluralCase(locale)(parseInt(value, 10));
  const result = pluralMapping[plural2];
  return result !== void 0 ? result : "other";
}
var DEFAULT_LOCALE_ID = "en-US";
var USD_CURRENCY_CODE = "USD";
var ELEMENT_MARKER = {
  marker: "element"
};
var ICU_MARKER = {
  marker: "ICU"
};
var I18nCreateOpCode;
(function(I18nCreateOpCode2) {
  I18nCreateOpCode2[I18nCreateOpCode2["SHIFT"] = 2] = "SHIFT";
  I18nCreateOpCode2[I18nCreateOpCode2["APPEND_EAGERLY"] = 1] = "APPEND_EAGERLY";
  I18nCreateOpCode2[I18nCreateOpCode2["COMMENT"] = 2] = "COMMENT";
})(I18nCreateOpCode || (I18nCreateOpCode = {}));
var LOCALE_ID$1 = DEFAULT_LOCALE_ID;
function setLocaleId(localeId) {
  ngDevMode && assertDefined(localeId, `Expected localeId to be defined`);
  if (typeof localeId === "string") {
    LOCALE_ID$1 = localeId.toLowerCase().replace(/_/g, "-");
  }
}
function getLocaleId() {
  return LOCALE_ID$1;
}
var changeMask = 0;
var changeMaskCounter = 0;
function setMaskBit(hasChange) {
  if (hasChange) {
    changeMask = changeMask | 1 << Math.min(changeMaskCounter, 31);
  }
  changeMaskCounter++;
}
function applyI18n(tView, lView, index) {
  if (changeMaskCounter > 0) {
    ngDevMode && assertDefined(tView, `tView should be defined`);
    const tI18n = tView.data[index];
    const updateOpCodes = Array.isArray(tI18n) ? tI18n : tI18n.update;
    const bindingsStartIndex = getBindingIndex() - changeMaskCounter - 1;
    applyUpdateOpCodes(tView, lView, updateOpCodes, bindingsStartIndex, changeMask);
  }
  changeMask = 0;
  changeMaskCounter = 0;
}
function createNodeWithoutHydration(lView, textOrName, nodeType) {
  const renderer = lView[RENDERER];
  switch (nodeType) {
    case Node.COMMENT_NODE:
      return createCommentNode(renderer, textOrName);
    case Node.TEXT_NODE:
      return createTextNode(renderer, textOrName);
    case Node.ELEMENT_NODE:
      return createElementNode(renderer, textOrName, null);
  }
}
var _locateOrCreateNode = (lView, index, textOrName, nodeType) => {
  lastNodeWasCreated(true);
  return createNodeWithoutHydration(lView, textOrName, nodeType);
};
function locateOrCreateNodeImpl(lView, index, textOrName, nodeType) {
  const hydrationInfo = lView[HYDRATION];
  const noOffsetIndex = index - HEADER_OFFSET;
  const isNodeCreationMode = !isI18nHydrationSupportEnabled() || !hydrationInfo || isInSkipHydrationBlock() || isDisconnectedNode$1(hydrationInfo, noOffsetIndex);
  lastNodeWasCreated(isNodeCreationMode);
  if (isNodeCreationMode) {
    return createNodeWithoutHydration(lView, textOrName, nodeType);
  }
  const native = locateI18nRNodeByIndex(hydrationInfo, noOffsetIndex);
  ngDevMode && assertDefined(native, "expected native element");
  ngDevMode && assertEqual(native.nodeType, nodeType, "expected matching nodeType");
  ngDevMode && nodeType === Node.ELEMENT_NODE && assertEqual(native.tagName.toLowerCase(), textOrName.toLowerCase(), "expecting matching tagName");
  ngDevMode && markRNodeAsClaimedByHydration(native);
  return native;
}
function enableLocateOrCreateI18nNodeImpl() {
  _locateOrCreateNode = locateOrCreateNodeImpl;
}
function applyCreateOpCodes(lView, createOpCodes, parentRNode, insertInFrontOf) {
  const renderer = lView[RENDERER];
  for (let i = 0; i < createOpCodes.length; i++) {
    const opCode = createOpCodes[i++];
    const text = createOpCodes[i];
    const isComment = (opCode & I18nCreateOpCode.COMMENT) === I18nCreateOpCode.COMMENT;
    const appendNow = (opCode & I18nCreateOpCode.APPEND_EAGERLY) === I18nCreateOpCode.APPEND_EAGERLY;
    const index = opCode >>> I18nCreateOpCode.SHIFT;
    let rNode = lView[index];
    let lastNodeWasCreated2 = false;
    if (rNode === null) {
      rNode = lView[index] = _locateOrCreateNode(lView, index, text, isComment ? Node.COMMENT_NODE : Node.TEXT_NODE);
      lastNodeWasCreated2 = wasLastNodeCreated();
    }
    if (appendNow && parentRNode !== null && lastNodeWasCreated2) {
      nativeInsertBefore(renderer, parentRNode, rNode, insertInFrontOf, false);
    }
  }
}
function applyMutableOpCodes(tView, mutableOpCodes, lView, anchorRNode) {
  ngDevMode && assertDomNode(anchorRNode);
  const renderer = lView[RENDERER];
  let rootIdx = null;
  let rootRNode;
  for (let i = 0; i < mutableOpCodes.length; i++) {
    const opCode = mutableOpCodes[i];
    if (typeof opCode == "string") {
      const textNodeIndex = mutableOpCodes[++i];
      if (lView[textNodeIndex] === null) {
        ngDevMode && assertIndexInRange(lView, textNodeIndex);
        lView[textNodeIndex] = _locateOrCreateNode(lView, textNodeIndex, opCode, Node.TEXT_NODE);
      }
    } else if (typeof opCode == "number") {
      switch (opCode & 1) {
        case 0:
          const parentIdx = getParentFromIcuCreateOpCode(opCode);
          if (rootIdx === null) {
            rootIdx = parentIdx;
            rootRNode = renderer.parentNode(anchorRNode);
          }
          let insertInFrontOf;
          let parentRNode;
          if (parentIdx === rootIdx) {
            insertInFrontOf = anchorRNode;
            parentRNode = rootRNode;
          } else {
            insertInFrontOf = null;
            parentRNode = unwrapRNode(lView[parentIdx]);
          }
          if (parentRNode !== null) {
            ngDevMode && assertDomNode(parentRNode);
            const refIdx = getRefFromIcuCreateOpCode(opCode);
            ngDevMode && assertGreaterThan(refIdx, HEADER_OFFSET, "Missing ref");
            const child = lView[refIdx];
            ngDevMode && assertDomNode(child);
            nativeInsertBefore(renderer, parentRNode, child, insertInFrontOf, false);
            const tIcu = getTIcu(tView, refIdx);
            if (tIcu !== null && typeof tIcu === "object") {
              ngDevMode && assertTIcu(tIcu);
              const caseIndex = getCurrentICUCaseIndex(tIcu, lView);
              if (caseIndex !== null) {
                applyMutableOpCodes(tView, tIcu.create[caseIndex], lView, lView[tIcu.anchorIdx]);
              }
            }
          }
          break;
        case 1:
          const elementNodeIndex = opCode >>> 1;
          const attrName = mutableOpCodes[++i];
          const attrValue = mutableOpCodes[++i];
          setElementAttribute(renderer, getNativeByIndex(elementNodeIndex, lView), null, null, attrName, attrValue, null);
          break;
        default:
          if (ngDevMode) {
            throw new RuntimeError(700, `Unable to determine the type of mutate operation for "${opCode}"`);
          }
      }
    } else {
      switch (opCode) {
        case ICU_MARKER:
          const commentValue = mutableOpCodes[++i];
          const commentNodeIndex = mutableOpCodes[++i];
          if (lView[commentNodeIndex] === null) {
            ngDevMode && assertEqual(typeof commentValue, "string", `Expected "${commentValue}" to be a comment node value`);
            ngDevMode && assertIndexInExpandoRange(lView, commentNodeIndex);
            const commentRNode = lView[commentNodeIndex] = _locateOrCreateNode(lView, commentNodeIndex, commentValue, Node.COMMENT_NODE);
            attachPatchData(commentRNode, lView);
          }
          break;
        case ELEMENT_MARKER:
          const tagName = mutableOpCodes[++i];
          const elementNodeIndex = mutableOpCodes[++i];
          if (lView[elementNodeIndex] === null) {
            ngDevMode && assertEqual(typeof tagName, "string", `Expected "${tagName}" to be an element node tag name`);
            ngDevMode && assertIndexInExpandoRange(lView, elementNodeIndex);
            const elementRNode = lView[elementNodeIndex] = _locateOrCreateNode(lView, elementNodeIndex, tagName, Node.ELEMENT_NODE);
            attachPatchData(elementRNode, lView);
          }
          break;
        default:
          ngDevMode && throwError(`Unable to determine the type of mutate operation for "${opCode}"`);
      }
    }
  }
}
function applyUpdateOpCodes(tView, lView, updateOpCodes, bindingsStartIndex, changeMask2) {
  for (let i = 0; i < updateOpCodes.length; i++) {
    const checkBit = updateOpCodes[i];
    const skipCodes = updateOpCodes[++i];
    if (checkBit & changeMask2) {
      let value = "";
      for (let j = i + 1; j <= i + skipCodes; j++) {
        const opCode = updateOpCodes[j];
        if (typeof opCode == "string") {
          value += opCode;
        } else if (typeof opCode == "number") {
          if (opCode < 0) {
            value += renderStringify(lView[bindingsStartIndex - opCode]);
          } else {
            const nodeIndex = opCode >>> 2;
            switch (opCode & 3) {
              case 1:
                const propName = updateOpCodes[++j];
                const sanitizeFn = updateOpCodes[++j];
                const tNodeOrTagName = tView.data[nodeIndex];
                ngDevMode && assertDefined(tNodeOrTagName, "Experting TNode or string");
                if (typeof tNodeOrTagName === "string") {
                  setElementAttribute(lView[RENDERER], lView[nodeIndex], null, tNodeOrTagName, propName, value, sanitizeFn);
                } else {
                  setPropertyAndInputs(tNodeOrTagName, lView, propName, value, lView[RENDERER], sanitizeFn);
                }
                break;
              case 0:
                const rText = lView[nodeIndex];
                rText !== null && updateTextNode(lView[RENDERER], rText, value);
                break;
              case 2:
                applyIcuSwitchCase(tView, getTIcu(tView, nodeIndex), lView, value);
                break;
              case 3:
                applyIcuUpdateCase(tView, getTIcu(tView, nodeIndex), bindingsStartIndex, lView);
                break;
            }
          }
        }
      }
    } else {
      const opCode = updateOpCodes[i + 1];
      if (opCode > 0 && (opCode & 3) === 3) {
        const nodeIndex = opCode >>> 2;
        const tIcu = getTIcu(tView, nodeIndex);
        const currentIndex = lView[tIcu.currentCaseLViewIndex];
        if (currentIndex < 0) {
          applyIcuUpdateCase(tView, tIcu, bindingsStartIndex, lView);
        }
      }
    }
    i += skipCodes;
  }
}
function applyIcuUpdateCase(tView, tIcu, bindingsStartIndex, lView) {
  ngDevMode && assertIndexInRange(lView, tIcu.currentCaseLViewIndex);
  let activeCaseIndex = lView[tIcu.currentCaseLViewIndex];
  if (activeCaseIndex !== null) {
    let mask = changeMask;
    if (activeCaseIndex < 0) {
      activeCaseIndex = lView[tIcu.currentCaseLViewIndex] = ~activeCaseIndex;
      mask = -1;
    }
    applyUpdateOpCodes(tView, lView, tIcu.update[activeCaseIndex], bindingsStartIndex, mask);
  }
}
function applyIcuSwitchCase(tView, tIcu, lView, value) {
  const caseIndex = getCaseIndex(tIcu, value);
  let activeCaseIndex = getCurrentICUCaseIndex(tIcu, lView);
  if (activeCaseIndex !== caseIndex) {
    applyIcuSwitchCaseRemove(tView, tIcu, lView);
    lView[tIcu.currentCaseLViewIndex] = caseIndex === null ? null : ~caseIndex;
    if (caseIndex !== null) {
      const anchorRNode = lView[tIcu.anchorIdx];
      if (anchorRNode) {
        ngDevMode && assertDomNode(anchorRNode);
        applyMutableOpCodes(tView, tIcu.create[caseIndex], lView, anchorRNode);
      }
      claimDehydratedIcuCase(lView, tIcu.anchorIdx, caseIndex);
    }
  }
}
function applyIcuSwitchCaseRemove(tView, tIcu, lView) {
  let activeCaseIndex = getCurrentICUCaseIndex(tIcu, lView);
  if (activeCaseIndex !== null) {
    const removeCodes = tIcu.remove[activeCaseIndex];
    for (let i = 0; i < removeCodes.length; i++) {
      const nodeOrIcuIndex = removeCodes[i];
      if (nodeOrIcuIndex > 0) {
        const rNode = getNativeByIndex(nodeOrIcuIndex, lView);
        rNode !== null && nativeRemoveNode(lView[RENDERER], rNode);
      } else {
        applyIcuSwitchCaseRemove(tView, getTIcu(tView, ~nodeOrIcuIndex), lView);
      }
    }
  }
}
function getCaseIndex(icuExpression, bindingValue) {
  let index = icuExpression.cases.indexOf(bindingValue);
  if (index === -1) {
    switch (icuExpression.type) {
      case 1: {
        const resolvedCase = getPluralCase(bindingValue, getLocaleId());
        index = icuExpression.cases.indexOf(resolvedCase);
        if (index === -1 && resolvedCase !== "other") {
          index = icuExpression.cases.indexOf("other");
        }
        break;
      }
      case 0: {
        index = icuExpression.cases.indexOf("other");
        break;
      }
    }
  }
  return index === -1 ? null : index;
}
function i18nCreateOpCodesToString(opcodes) {
  const createOpCodes = opcodes || (Array.isArray(this) ? this : []);
  let lines = [];
  for (let i = 0; i < createOpCodes.length; i++) {
    const opCode = createOpCodes[i++];
    const text = createOpCodes[i];
    const isComment = (opCode & I18nCreateOpCode.COMMENT) === I18nCreateOpCode.COMMENT;
    const appendNow = (opCode & I18nCreateOpCode.APPEND_EAGERLY) === I18nCreateOpCode.APPEND_EAGERLY;
    const index = opCode >>> I18nCreateOpCode.SHIFT;
    lines.push(`lView[${index}] = document.${isComment ? "createComment" : "createText"}(${JSON.stringify(text)});`);
    if (appendNow) {
      lines.push(`parent.appendChild(lView[${index}]);`);
    }
  }
  return lines;
}
function i18nUpdateOpCodesToString(opcodes) {
  const parser = new OpCodeParser(opcodes || (Array.isArray(this) ? this : []));
  let lines = [];
  function consumeOpCode(value) {
    const ref = value >>> 2;
    const opCode = value & 3;
    switch (opCode) {
      case 0:
        return `(lView[${ref}] as Text).textContent = $$$`;
      case 1:
        const attrName = parser.consumeString();
        const sanitizationFn = parser.consumeFunction();
        const value2 = sanitizationFn ? `(${sanitizationFn})($$$)` : "$$$";
        return `(lView[${ref}] as Element).setAttribute('${attrName}', ${value2})`;
      case 2:
        return `icuSwitchCase(${ref}, $$$)`;
      case 3:
        return `icuUpdateCase(${ref})`;
    }
    throw new Error("unexpected OpCode");
  }
  while (parser.hasMore()) {
    let mask = parser.consumeNumber();
    let size = parser.consumeNumber();
    const end = parser.i + size;
    const statements = [];
    let statement = "";
    while (parser.i < end) {
      let value = parser.consumeNumberOrString();
      if (typeof value === "string") {
        statement += value;
      } else if (value < 0) {
        statement += "${lView[i" + value + "]}";
      } else {
        const opCodeText = consumeOpCode(value);
        statements.push(opCodeText.replace("$$$", "`" + statement + "`") + ";");
        statement = "";
      }
    }
    lines.push(`if (mask & 0b${mask.toString(2)}) { ${statements.join(" ")} }`);
  }
  return lines;
}
function icuCreateOpCodesToString(opcodes) {
  const parser = new OpCodeParser(opcodes || (Array.isArray(this) ? this : []));
  let lines = [];
  function consumeOpCode(opCode) {
    const parent = getParentFromIcuCreateOpCode(opCode);
    const ref = getRefFromIcuCreateOpCode(opCode);
    switch (getInstructionFromIcuCreateOpCode(opCode)) {
      case 0:
        return `(lView[${parent}] as Element).appendChild(lView[${lastRef}])`;
      case 1:
        return `(lView[${ref}] as Element).setAttribute("${parser.consumeString()}", "${parser.consumeString()}")`;
    }
    throw new Error("Unexpected OpCode: " + getInstructionFromIcuCreateOpCode(opCode));
  }
  let lastRef = -1;
  while (parser.hasMore()) {
    let value = parser.consumeNumberStringOrMarker();
    if (value === ICU_MARKER) {
      const text = parser.consumeString();
      lastRef = parser.consumeNumber();
      lines.push(`lView[${lastRef}] = document.createComment("${text}")`);
    } else if (value === ELEMENT_MARKER) {
      const text = parser.consumeString();
      lastRef = parser.consumeNumber();
      lines.push(`lView[${lastRef}] = document.createElement("${text}")`);
    } else if (typeof value === "string") {
      lastRef = parser.consumeNumber();
      lines.push(`lView[${lastRef}] = document.createTextNode("${value}")`);
    } else if (typeof value === "number") {
      const line = consumeOpCode(value);
      line && lines.push(line);
    } else {
      throw new Error("Unexpected value");
    }
  }
  return lines;
}
function i18nRemoveOpCodesToString(opcodes) {
  const removeCodes = opcodes || (Array.isArray(this) ? this : []);
  let lines = [];
  for (let i = 0; i < removeCodes.length; i++) {
    const nodeOrIcuIndex = removeCodes[i];
    if (nodeOrIcuIndex > 0) {
      lines.push(`remove(lView[${nodeOrIcuIndex}])`);
    } else {
      lines.push(`removeNestedICU(${~nodeOrIcuIndex})`);
    }
  }
  return lines;
}
var OpCodeParser = class {
  i = 0;
  codes;
  constructor(codes) {
    this.codes = codes;
  }
  hasMore() {
    return this.i < this.codes.length;
  }
  consumeNumber() {
    let value = this.codes[this.i++];
    assertNumber(value, "expecting number in OpCode");
    return value;
  }
  consumeString() {
    let value = this.codes[this.i++];
    assertString(value, "expecting string in OpCode");
    return value;
  }
  consumeFunction() {
    let value = this.codes[this.i++];
    if (value === null || typeof value === "function") {
      return value;
    }
    throw new Error("expecting function in OpCode");
  }
  consumeNumberOrString() {
    let value = this.codes[this.i++];
    if (typeof value === "string") {
      return value;
    }
    assertNumber(value, "expecting number or string in OpCode");
    return value;
  }
  consumeNumberStringOrMarker() {
    let value = this.codes[this.i++];
    if (typeof value === "string" || typeof value === "number" || value == ICU_MARKER || value == ELEMENT_MARKER) {
      return value;
    }
    assertNumber(value, "expecting number, string, ICU_MARKER or ELEMENT_MARKER in OpCode");
    return value;
  }
};
var BINDING_REGEXP = /�(\d+):?\d*�/gi;
var ICU_REGEXP = /({\s*�\d+:?\d*�\s*,\s*\S{6}\s*,[\s\S]*})/gi;
var NESTED_ICU = /�(\d+)�/;
var ICU_BLOCK_REGEXP = /^\s*(�\d+:?\d*�)\s*,\s*(select|plural)\s*,/;
var MARKER = `�`;
var SUBTEMPLATE_REGEXP = /�\/?\*(\d+:\d+)�/gi;
var PH_REGEXP = /�(\/?[#*]\d+):?\d*�/gi;
var NGSP_UNICODE_REGEXP = /\uE500/g;
function replaceNgsp(value) {
  return value.replace(NGSP_UNICODE_REGEXP, " ");
}
function attachDebugGetter(obj, debugGetter) {
  if (ngDevMode) {
    Object.defineProperty(obj, "debug", {
      get: debugGetter,
      enumerable: false
    });
  } else {
    throw new Error("This method should be guarded with `ngDevMode` so that it can be tree shaken in production!");
  }
}
function i18nStartFirstCreatePass(tView, parentTNodeIndex, lView, index, message, subTemplateIndex) {
  const rootTNode = getCurrentParentTNode();
  const createOpCodes = [];
  const updateOpCodes = [];
  const existingTNodeStack = [[]];
  const astStack = [[]];
  if (ngDevMode) {
    attachDebugGetter(createOpCodes, i18nCreateOpCodesToString);
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }
  message = getTranslationForTemplate(message, subTemplateIndex);
  const msgParts = replaceNgsp(message).split(PH_REGEXP);
  for (let i = 0; i < msgParts.length; i++) {
    let value = msgParts[i];
    if ((i & 1) === 0) {
      const parts = i18nParseTextIntoPartsAndICU(value);
      for (let j = 0; j < parts.length; j++) {
        let part = parts[j];
        if ((j & 1) === 0) {
          const text = part;
          ngDevMode && assertString(text, "Parsed ICU part should be string");
          if (text !== "") {
            i18nStartFirstCreatePassProcessTextNode(astStack[0], tView, rootTNode, existingTNodeStack[0], createOpCodes, updateOpCodes, lView, text);
          }
        } else {
          const icuExpression = part;
          if (typeof icuExpression !== "object") {
            throw new Error(`Unable to parse ICU expression in "${message}" message.`);
          }
          const icuContainerTNode = createTNodeAndAddOpCode(tView, rootTNode, existingTNodeStack[0], lView, createOpCodes, ngDevMode ? `ICU ${index}:${icuExpression.mainBinding}` : "", true);
          const icuNodeIndex = icuContainerTNode.index;
          ngDevMode && assertGreaterThanOrEqual(icuNodeIndex, HEADER_OFFSET, "Index must be in absolute LView offset");
          icuStart(astStack[0], tView, lView, updateOpCodes, parentTNodeIndex, icuExpression, icuNodeIndex);
        }
      }
    } else {
      const isClosing = value.charCodeAt(0) === 47;
      const type = value.charCodeAt(isClosing ? 1 : 0);
      ngDevMode && assertOneOf(type, 42, 35);
      const index2 = HEADER_OFFSET + Number.parseInt(value.substring(isClosing ? 2 : 1));
      if (isClosing) {
        existingTNodeStack.shift();
        astStack.shift();
        setCurrentTNode(getCurrentParentTNode(), false);
      } else {
        const tNode = createTNodePlaceholder(tView, existingTNodeStack[0], index2);
        existingTNodeStack.unshift([]);
        setCurrentTNode(tNode, true);
        const placeholderNode = {
          kind: 2,
          index: index2,
          children: [],
          type: type === 35 ? 0 : 1
        };
        astStack[0].push(placeholderNode);
        astStack.unshift(placeholderNode.children);
      }
    }
  }
  tView.data[index] = {
    create: createOpCodes,
    update: updateOpCodes,
    ast: astStack[0],
    parentTNodeIndex
  };
}
function createTNodeAndAddOpCode(tView, rootTNode, existingTNodes, lView, createOpCodes, text, isICU) {
  const i18nNodeIdx = allocExpando(tView, lView, 1, null);
  let opCode = i18nNodeIdx << I18nCreateOpCode.SHIFT;
  let parentTNode = getCurrentParentTNode();
  if (rootTNode === parentTNode) {
    parentTNode = null;
  }
  if (parentTNode === null) {
    opCode |= I18nCreateOpCode.APPEND_EAGERLY;
  }
  if (isICU) {
    opCode |= I18nCreateOpCode.COMMENT;
    ensureIcuContainerVisitorLoaded(loadIcuContainerVisitor);
  }
  createOpCodes.push(opCode, text === null ? "" : text);
  const tNode = createTNodeAtIndex(tView, i18nNodeIdx, isICU ? 32 : 1, text === null ? ngDevMode ? "{{?}}" : "" : text, null);
  addTNodeAndUpdateInsertBeforeIndex(existingTNodes, tNode);
  const tNodeIdx = tNode.index;
  setCurrentTNode(tNode, false);
  if (parentTNode !== null && rootTNode !== parentTNode) {
    setTNodeInsertBeforeIndex(parentTNode, tNodeIdx);
  }
  return tNode;
}
function i18nStartFirstCreatePassProcessTextNode(ast, tView, rootTNode, existingTNodes, createOpCodes, updateOpCodes, lView, text) {
  const hasBinding = text.match(BINDING_REGEXP);
  const tNode = createTNodeAndAddOpCode(tView, rootTNode, existingTNodes, lView, createOpCodes, hasBinding ? null : text, false);
  const index = tNode.index;
  if (hasBinding) {
    generateBindingUpdateOpCodes(updateOpCodes, text, index, null, 0, null);
  }
  ast.push({
    kind: 0,
    index
  });
}
function i18nAttributesFirstPass(tView, index, values) {
  const previousElement = getCurrentTNode();
  const previousElementIndex = previousElement.index;
  const updateOpCodes = [];
  if (ngDevMode) {
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }
  if (tView.firstCreatePass && tView.data[index] === null) {
    for (let i = 0; i < values.length; i += 2) {
      const attrName = values[i];
      const message = values[i + 1];
      if (message !== "") {
        if (ICU_REGEXP.test(message)) {
          throw new Error(`ICU expressions are not supported in attributes. Message: "${message}".`);
        }
        generateBindingUpdateOpCodes(updateOpCodes, message, previousElementIndex, attrName, countBindings(updateOpCodes), null);
      }
    }
    tView.data[index] = updateOpCodes;
  }
}
function generateBindingUpdateOpCodes(updateOpCodes, str, destinationNode, attrName, bindingStart, sanitizeFn) {
  ngDevMode && assertGreaterThanOrEqual(destinationNode, HEADER_OFFSET, "Index must be in absolute LView offset");
  const maskIndex = updateOpCodes.length;
  const sizeIndex = maskIndex + 1;
  updateOpCodes.push(null, null);
  const startIndex = maskIndex + 2;
  if (ngDevMode) {
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }
  const textParts = str.split(BINDING_REGEXP);
  let mask = 0;
  for (let j = 0; j < textParts.length; j++) {
    const textValue = textParts[j];
    if (j & 1) {
      const bindingIndex = bindingStart + parseInt(textValue, 10);
      updateOpCodes.push(-1 - bindingIndex);
      mask = mask | toMaskBit(bindingIndex);
    } else if (textValue !== "") {
      updateOpCodes.push(textValue);
    }
  }
  updateOpCodes.push(destinationNode << 2 | (attrName ? 1 : 0));
  if (attrName) {
    updateOpCodes.push(attrName, sanitizeFn);
  }
  updateOpCodes[maskIndex] = mask;
  updateOpCodes[sizeIndex] = updateOpCodes.length - startIndex;
  return mask;
}
function countBindings(opCodes) {
  let count = 0;
  for (let i = 0; i < opCodes.length; i++) {
    const opCode = opCodes[i];
    if (typeof opCode === "number" && opCode < 0) {
      count++;
    }
  }
  return count;
}
function toMaskBit(bindingIndex) {
  return 1 << Math.min(bindingIndex, 31);
}
function removeInnerTemplateTranslation(message) {
  let match;
  let res = "";
  let index = 0;
  let inTemplate = false;
  let tagMatched;
  while ((match = SUBTEMPLATE_REGEXP.exec(message)) !== null) {
    if (!inTemplate) {
      res += message.substring(index, match.index + match[0].length);
      tagMatched = match[1];
      inTemplate = true;
    } else {
      if (match[0] === `${MARKER}/*${tagMatched}${MARKER}`) {
        index = match.index;
        inTemplate = false;
      }
    }
  }
  ngDevMode && assertEqual(inTemplate, false, `Tag mismatch: unable to find the end of the sub-template in the translation "${message}"`);
  res += message.slice(index);
  return res;
}
function getTranslationForTemplate(message, subTemplateIndex) {
  if (isRootTemplateMessage(subTemplateIndex)) {
    return removeInnerTemplateTranslation(message);
  } else {
    const start = message.indexOf(`:${subTemplateIndex}${MARKER}`) + 2 + subTemplateIndex.toString().length;
    const end = message.search(new RegExp(`${MARKER}\\/\\*\\d+:${subTemplateIndex}${MARKER}`));
    return removeInnerTemplateTranslation(message.substring(start, end));
  }
}
function icuStart(ast, tView, lView, updateOpCodes, parentIdx, icuExpression, anchorIdx) {
  ngDevMode && assertDefined(icuExpression, "ICU expression must be defined");
  let bindingMask = 0;
  const tIcu = {
    type: icuExpression.type,
    currentCaseLViewIndex: allocExpando(tView, lView, 1, null),
    anchorIdx,
    cases: [],
    create: [],
    remove: [],
    update: []
  };
  addUpdateIcuSwitch(updateOpCodes, icuExpression, anchorIdx);
  setTIcu(tView, anchorIdx, tIcu);
  const values = icuExpression.values;
  const cases = [];
  for (let i = 0; i < values.length; i++) {
    const valueArr = values[i];
    const nestedIcus = [];
    for (let j = 0; j < valueArr.length; j++) {
      const value = valueArr[j];
      if (typeof value !== "string") {
        const icuIndex = nestedIcus.push(value) - 1;
        valueArr[j] = `<!--�${icuIndex}�-->`;
      }
    }
    const caseAst = [];
    cases.push(caseAst);
    bindingMask = parseIcuCase(caseAst, tView, tIcu, lView, updateOpCodes, parentIdx, icuExpression.cases[i], valueArr.join(""), nestedIcus) | bindingMask;
  }
  if (bindingMask) {
    addUpdateIcuUpdate(updateOpCodes, bindingMask, anchorIdx);
  }
  ast.push({
    kind: 3,
    index: anchorIdx,
    cases,
    currentCaseLViewIndex: tIcu.currentCaseLViewIndex
  });
}
function parseICUBlock(pattern) {
  const cases = [];
  const values = [];
  let icuType = 1;
  let mainBinding = 0;
  pattern = pattern.replace(ICU_BLOCK_REGEXP, function(str, binding, type) {
    if (type === "select") {
      icuType = 0;
    } else {
      icuType = 1;
    }
    mainBinding = parseInt(binding.slice(1), 10);
    return "";
  });
  const parts = i18nParseTextIntoPartsAndICU(pattern);
  for (let pos = 0; pos < parts.length; ) {
    let key = parts[pos++].trim();
    if (icuType === 1) {
      key = key.replace(/\s*(?:=)?(\w+)\s*/, "$1");
    }
    if (key.length) {
      cases.push(key);
    }
    const blocks = i18nParseTextIntoPartsAndICU(parts[pos++]);
    if (cases.length > values.length) {
      values.push(blocks);
    }
  }
  return {
    type: icuType,
    mainBinding,
    cases,
    values
  };
}
function i18nParseTextIntoPartsAndICU(pattern) {
  if (!pattern) {
    return [];
  }
  let prevPos = 0;
  const braceStack = [];
  const results = [];
  const braces = /[{}]/g;
  braces.lastIndex = 0;
  let match;
  while (match = braces.exec(pattern)) {
    const pos = match.index;
    if (match[0] == "}") {
      braceStack.pop();
      if (braceStack.length == 0) {
        const block = pattern.substring(prevPos, pos);
        if (ICU_BLOCK_REGEXP.test(block)) {
          results.push(parseICUBlock(block));
        } else {
          results.push(block);
        }
        prevPos = pos + 1;
      }
    } else {
      if (braceStack.length == 0) {
        const substring2 = pattern.substring(prevPos, pos);
        results.push(substring2);
        prevPos = pos + 1;
      }
      braceStack.push("{");
    }
  }
  const substring = pattern.substring(prevPos);
  results.push(substring);
  return results;
}
function parseIcuCase(ast, tView, tIcu, lView, updateOpCodes, parentIdx, caseName, unsafeCaseHtml, nestedIcus) {
  const create = [];
  const remove2 = [];
  const update = [];
  if (ngDevMode) {
    attachDebugGetter(create, icuCreateOpCodesToString);
    attachDebugGetter(remove2, i18nRemoveOpCodesToString);
    attachDebugGetter(update, i18nUpdateOpCodesToString);
  }
  tIcu.cases.push(caseName);
  tIcu.create.push(create);
  tIcu.remove.push(remove2);
  tIcu.update.push(update);
  const inertBodyHelper2 = getInertBodyHelper(getDocument());
  const inertBodyElement = inertBodyHelper2.getInertBodyElement(unsafeCaseHtml);
  ngDevMode && assertDefined(inertBodyElement, "Unable to generate inert body element");
  const inertRootNode = getTemplateContent(inertBodyElement) || inertBodyElement;
  if (inertRootNode) {
    return walkIcuTree(ast, tView, tIcu, lView, updateOpCodes, create, remove2, update, inertRootNode, parentIdx, nestedIcus, 0);
  } else {
    return 0;
  }
}
function walkIcuTree(ast, tView, tIcu, lView, sharedUpdateOpCodes, create, remove2, update, parentNode, parentIdx, nestedIcus, depth) {
  let bindingMask = 0;
  let currentNode = parentNode.firstChild;
  while (currentNode) {
    const newIndex = allocExpando(tView, lView, 1, null);
    switch (currentNode.nodeType) {
      case Node.ELEMENT_NODE:
        const element = currentNode;
        const tagName = element.tagName.toLowerCase();
        if (VALID_ELEMENTS.hasOwnProperty(tagName)) {
          addCreateNodeAndAppend(create, ELEMENT_MARKER, tagName, parentIdx, newIndex);
          tView.data[newIndex] = tagName;
          const elAttrs = element.attributes;
          for (let i = 0; i < elAttrs.length; i++) {
            const attr = elAttrs.item(i);
            const lowerAttrName = attr.name.toLowerCase();
            const hasBinding2 = !!attr.value.match(BINDING_REGEXP);
            if (hasBinding2) {
              if (VALID_ATTRS.hasOwnProperty(lowerAttrName)) {
                if (URI_ATTRS[lowerAttrName]) {
                  generateBindingUpdateOpCodes(update, attr.value, newIndex, attr.name, 0, _sanitizeUrl);
                } else {
                  generateBindingUpdateOpCodes(update, attr.value, newIndex, attr.name, 0, null);
                }
              } else {
                ngDevMode && console.warn(`WARNING: ignoring unsafe attribute value ${lowerAttrName} on element ${tagName} (see ${XSS_SECURITY_URL})`);
              }
            } else {
              addCreateAttribute(create, newIndex, attr);
            }
          }
          const elementNode = {
            kind: 1,
            index: newIndex,
            children: []
          };
          ast.push(elementNode);
          bindingMask = walkIcuTree(elementNode.children, tView, tIcu, lView, sharedUpdateOpCodes, create, remove2, update, currentNode, newIndex, nestedIcus, depth + 1) | bindingMask;
          addRemoveNode(remove2, newIndex, depth);
        }
        break;
      case Node.TEXT_NODE:
        const value = currentNode.textContent || "";
        const hasBinding = value.match(BINDING_REGEXP);
        addCreateNodeAndAppend(create, null, hasBinding ? "" : value, parentIdx, newIndex);
        addRemoveNode(remove2, newIndex, depth);
        if (hasBinding) {
          bindingMask = generateBindingUpdateOpCodes(update, value, newIndex, null, 0, null) | bindingMask;
        }
        ast.push({
          kind: 0,
          index: newIndex
        });
        break;
      case Node.COMMENT_NODE:
        const isNestedIcu = NESTED_ICU.exec(currentNode.textContent || "");
        if (isNestedIcu) {
          const nestedIcuIndex = parseInt(isNestedIcu[1], 10);
          const icuExpression = nestedIcus[nestedIcuIndex];
          addCreateNodeAndAppend(create, ICU_MARKER, ngDevMode ? `nested ICU ${nestedIcuIndex}` : "", parentIdx, newIndex);
          icuStart(ast, tView, lView, sharedUpdateOpCodes, parentIdx, icuExpression, newIndex);
          addRemoveNestedIcu(remove2, newIndex, depth);
        }
        break;
    }
    currentNode = currentNode.nextSibling;
  }
  return bindingMask;
}
function addRemoveNode(remove2, index, depth) {
  if (depth === 0) {
    remove2.push(index);
  }
}
function addRemoveNestedIcu(remove2, index, depth) {
  if (depth === 0) {
    remove2.push(~index);
    remove2.push(index);
  }
}
function addUpdateIcuSwitch(update, icuExpression, index) {
  update.push(toMaskBit(icuExpression.mainBinding), 2, -1 - icuExpression.mainBinding, index << 2 | 2);
}
function addUpdateIcuUpdate(update, bindingMask, index) {
  update.push(bindingMask, 1, index << 2 | 3);
}
function addCreateNodeAndAppend(create, marker, text, appendToParentIdx, createAtIdx) {
  if (marker !== null) {
    create.push(marker);
  }
  create.push(text, createAtIdx, icuCreateOpCode(0, appendToParentIdx, createAtIdx));
}
function addCreateAttribute(create, newIndex, attr) {
  create.push(newIndex << 1 | 1, attr.name, attr.value);
}
var ROOT_TEMPLATE_ID = 0;
var PP_MULTI_VALUE_PLACEHOLDERS_REGEXP = /\[(�.+?�?)\]/;
var PP_PLACEHOLDERS_REGEXP = /\[(�.+?�?)\]|(�\/?\*\d+:\d+�)/g;
var PP_ICU_VARS_REGEXP = /({\s*)(VAR_(PLURAL|SELECT)(_\d+)?)(\s*,)/g;
var PP_ICU_PLACEHOLDERS_REGEXP = /{([A-Z0-9_]+)}/g;
var PP_ICUS_REGEXP = /�I18N_EXP_(ICU(_\d+)?)�/g;
var PP_CLOSE_TEMPLATE_REGEXP = /\/\*/;
var PP_TEMPLATE_ID_REGEXP = /\d+\:(\d+)/;
function i18nPostprocess(message, replacements = {}) {
  let result = message;
  if (PP_MULTI_VALUE_PLACEHOLDERS_REGEXP.test(message)) {
    const matches = {};
    const templateIdsStack = [ROOT_TEMPLATE_ID];
    result = result.replace(PP_PLACEHOLDERS_REGEXP, (m, phs, tmpl) => {
      const content = phs || tmpl;
      const placeholders = matches[content] || [];
      if (!placeholders.length) {
        content.split("|").forEach((placeholder2) => {
          const match = placeholder2.match(PP_TEMPLATE_ID_REGEXP);
          const templateId2 = match ? parseInt(match[1], 10) : ROOT_TEMPLATE_ID;
          const isCloseTemplateTag2 = PP_CLOSE_TEMPLATE_REGEXP.test(placeholder2);
          placeholders.push([templateId2, isCloseTemplateTag2, placeholder2]);
        });
        matches[content] = placeholders;
      }
      if (!placeholders.length) {
        throw new Error(`i18n postprocess: unmatched placeholder - ${content}`);
      }
      const currentTemplateId = templateIdsStack[templateIdsStack.length - 1];
      let idx = 0;
      for (let i = 0; i < placeholders.length; i++) {
        if (placeholders[i][0] === currentTemplateId) {
          idx = i;
          break;
        }
      }
      const [templateId, isCloseTemplateTag, placeholder] = placeholders[idx];
      if (isCloseTemplateTag) {
        templateIdsStack.pop();
      } else if (currentTemplateId !== templateId) {
        templateIdsStack.push(templateId);
      }
      placeholders.splice(idx, 1);
      return placeholder;
    });
  }
  if (!Object.keys(replacements).length) {
    return result;
  }
  result = result.replace(PP_ICU_VARS_REGEXP, (match, start, key, _type, _idx, end) => {
    return replacements.hasOwnProperty(key) ? `${start}${replacements[key]}${end}` : match;
  });
  result = result.replace(PP_ICU_PLACEHOLDERS_REGEXP, (match, key) => {
    return replacements.hasOwnProperty(key) ? replacements[key] : match;
  });
  result = result.replace(PP_ICUS_REGEXP, (match, key) => {
    if (replacements.hasOwnProperty(key)) {
      const list = replacements[key];
      if (!list.length) {
        throw new Error(`i18n postprocess: unmatched ICU - ${match} with key: ${key}`);
      }
      return list.shift();
    }
    return match;
  });
  return result;
}
function ɵɵi18nStart(index, messageIndex, subTemplateIndex = -1) {
  const tView = getTView();
  const lView = getLView();
  const adjustedIndex = HEADER_OFFSET + index;
  ngDevMode && assertDefined(tView, `tView should be defined`);
  const message = getConstant(tView.consts, messageIndex);
  const parentTNode = getCurrentParentTNode();
  if (tView.firstCreatePass) {
    i18nStartFirstCreatePass(tView, parentTNode === null ? 0 : parentTNode.index, lView, adjustedIndex, message, subTemplateIndex);
  }
  if (tView.type === 2) {
    const componentLView = lView[DECLARATION_COMPONENT_VIEW];
    componentLView[FLAGS] |= 32;
  } else {
    lView[FLAGS] |= 32;
  }
  const tI18n = tView.data[adjustedIndex];
  const sameViewParentTNode = parentTNode === lView[T_HOST] ? null : parentTNode;
  const parentRNode = getClosestRElement(tView, sameViewParentTNode, lView);
  const insertInFrontOf = parentTNode && parentTNode.type & 8 ? lView[parentTNode.index] : null;
  prepareI18nBlockForHydration(lView, adjustedIndex, parentTNode, subTemplateIndex);
  applyCreateOpCodes(lView, tI18n.create, parentRNode, insertInFrontOf);
  setInI18nBlock(true);
}
function ɵɵi18nEnd() {
  setInI18nBlock(false);
}
function ɵɵi18n(index, messageIndex, subTemplateIndex) {
  ɵɵi18nStart(index, messageIndex, subTemplateIndex);
  ɵɵi18nEnd();
}
function ɵɵi18nAttributes(index, attrsIndex) {
  const tView = getTView();
  ngDevMode && assertDefined(tView, `tView should be defined`);
  const attrs = getConstant(tView.consts, attrsIndex);
  i18nAttributesFirstPass(tView, index + HEADER_OFFSET, attrs);
}
function ɵɵi18nExp(value) {
  const lView = getLView();
  setMaskBit(bindingUpdated(lView, nextBindingIndex(), value));
  return ɵɵi18nExp;
}
function ɵɵi18nApply(index) {
  applyI18n(getTView(), getLView(), index + HEADER_OFFSET);
}
function ɵɵi18nPostprocess(message, replacements = {}) {
  return i18nPostprocess(message, replacements);
}
function ɵɵlistener(eventName, listenerFn, eventTargetResolver) {
  const lView = getLView();
  const tView = getTView();
  const tNode = getCurrentTNode();
  listenerInternal(tView, lView, lView[RENDERER], tNode, eventName, listenerFn, eventTargetResolver);
  return ɵɵlistener;
}
function ɵɵsyntheticHostListener(eventName, listenerFn) {
  const tNode = getCurrentTNode();
  const lView = getLView();
  const tView = getTView();
  const currentDef = getCurrentDirectiveDef(tView.data);
  const renderer = loadComponentRenderer(currentDef, tNode, lView);
  listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn);
  return ɵɵsyntheticHostListener;
}
function ɵɵdomListener(eventName, listenerFn, eventTargetResolver) {
  const lView = getLView();
  const tView = getTView();
  const tNode = getCurrentTNode();
  if (tNode.type & 3 || eventTargetResolver) {
    listenToDomEvent(tNode, tView, lView, eventTargetResolver, lView[RENDERER], eventName, listenerFn, wrapListener(tNode, lView, listenerFn));
  }
  return ɵɵdomListener;
}
function listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn, eventTargetResolver) {
  ngDevMode && assertTNodeType(tNode, 3 | 12);
  let processOutputs = true;
  let wrappedListener = null;
  if (tNode.type & 3 || eventTargetResolver) {
    wrappedListener ??= wrapListener(tNode, lView, listenerFn);
    const hasCoalescedDomEvent = listenToDomEvent(tNode, tView, lView, eventTargetResolver, renderer, eventName, listenerFn, wrappedListener);
    if (hasCoalescedDomEvent) {
      processOutputs = false;
    }
  }
  if (processOutputs) {
    const outputConfig = tNode.outputs?.[eventName];
    const hostDirectiveOutputConfig = tNode.hostDirectiveOutputs?.[eventName];
    if (hostDirectiveOutputConfig && hostDirectiveOutputConfig.length) {
      for (let i = 0; i < hostDirectiveOutputConfig.length; i += 2) {
        const index = hostDirectiveOutputConfig[i];
        const lookupName = hostDirectiveOutputConfig[i + 1];
        wrappedListener ??= wrapListener(tNode, lView, listenerFn);
        listenToOutput(tNode, lView, index, lookupName, eventName, wrappedListener);
      }
    }
    if (outputConfig && outputConfig.length) {
      for (const index of outputConfig) {
        wrappedListener ??= wrapListener(tNode, lView, listenerFn);
        listenToOutput(tNode, lView, index, eventName, eventName, wrappedListener);
      }
    }
  }
}
function ɵɵnextContext(level = 1) {
  return nextContextImpl(level);
}
function matchingProjectionSlotIndex(tNode, projectionSlots) {
  let wildcardNgContentIndex = null;
  const ngProjectAsAttrVal = getProjectAsAttrValue(tNode);
  for (let i = 0; i < projectionSlots.length; i++) {
    const slotValue = projectionSlots[i];
    if (slotValue === "*") {
      wildcardNgContentIndex = i;
      continue;
    }
    if (ngProjectAsAttrVal === null ? isNodeMatchingSelectorList(tNode, slotValue, true) : isSelectorInSelectorList(ngProjectAsAttrVal, slotValue)) {
      return i;
    }
  }
  return wildcardNgContentIndex;
}
function ɵɵprojectionDef(projectionSlots) {
  const componentNode = getLView()[DECLARATION_COMPONENT_VIEW][T_HOST];
  if (!componentNode.projection) {
    const numProjectionSlots = projectionSlots ? projectionSlots.length : 1;
    const projectionHeads = componentNode.projection = newArray(numProjectionSlots, null);
    const tails = projectionHeads.slice();
    let componentChild = componentNode.child;
    while (componentChild !== null) {
      if (componentChild.type !== 128) {
        const slotIndex = projectionSlots ? matchingProjectionSlotIndex(componentChild, projectionSlots) : 0;
        if (slotIndex !== null) {
          if (tails[slotIndex]) {
            tails[slotIndex].projectionNext = componentChild;
          } else {
            projectionHeads[slotIndex] = componentChild;
          }
          tails[slotIndex] = componentChild;
        }
      }
      componentChild = componentChild.next;
    }
  }
}
function ɵɵprojection(nodeIndex, selectorIndex = 0, attrs, fallbackTemplateFn, fallbackDecls, fallbackVars) {
  const lView = getLView();
  const tView = getTView();
  const fallbackIndex = fallbackTemplateFn ? nodeIndex + 1 : null;
  if (fallbackIndex !== null) {
    declareNoDirectiveHostTemplate(lView, tView, fallbackIndex, fallbackTemplateFn, fallbackDecls, fallbackVars, null, attrs);
  }
  const tProjectionNode = getOrCreateTNode(tView, HEADER_OFFSET + nodeIndex, 16, null, attrs || null);
  if (tProjectionNode.projection === null) {
    tProjectionNode.projection = selectorIndex;
  }
  setCurrentTNodeAsNotParent();
  const hydrationInfo = lView[HYDRATION];
  const isNodeCreationMode = !hydrationInfo || isInSkipHydrationBlock();
  const componentHostNode = lView[DECLARATION_COMPONENT_VIEW][T_HOST];
  const isEmpty = componentHostNode.projection[tProjectionNode.projection] === null;
  if (isEmpty && fallbackIndex !== null) {
    insertFallbackContent(lView, tView, fallbackIndex);
  } else if (isNodeCreationMode && !isDetachedByI18n(tProjectionNode)) {
    applyProjection(tView, lView, tProjectionNode);
  }
}
function insertFallbackContent(lView, tView, fallbackIndex) {
  const adjustedIndex = HEADER_OFFSET + fallbackIndex;
  const fallbackTNode = tView.data[adjustedIndex];
  const fallbackLContainer = lView[adjustedIndex];
  ngDevMode && assertTNode(fallbackTNode);
  ngDevMode && assertLContainer(fallbackLContainer);
  const dehydratedView = findMatchingDehydratedView(fallbackLContainer, fallbackTNode.tView.ssrId);
  const fallbackLView = createAndRenderEmbeddedLView(lView, fallbackTNode, void 0, {
    dehydratedView
  });
  addLViewToLContainer(fallbackLContainer, fallbackLView, 0, shouldAddViewToDom(fallbackTNode, dehydratedView));
}
function ɵɵcontentQuery(directiveIndex, predicate, flags, read) {
  createContentQuery(directiveIndex, predicate, flags, read);
  return ɵɵcontentQuery;
}
function ɵɵviewQuery(predicate, flags, read) {
  createViewQuery(predicate, flags, read);
  return ɵɵviewQuery;
}
function ɵɵqueryRefresh(queryList) {
  const lView = getLView();
  const tView = getTView();
  const queryIndex = getCurrentQueryIndex();
  setCurrentQueryIndex(queryIndex + 1);
  const tQuery = getTQuery(tView, queryIndex);
  if (queryList.dirty && isCreationMode(lView) === ((tQuery.metadata.flags & 2) === 2)) {
    if (tQuery.matches === null) {
      queryList.reset([]);
    } else {
      const result = getQueryResults(lView, queryIndex);
      queryList.reset(result, unwrapElementRef);
      queryList.notifyOnChanges();
    }
    return true;
  }
  return false;
}
function ɵɵloadQuery() {
  return loadQueryInternal(getLView(), getCurrentQueryIndex());
}
function ɵɵcontentQuerySignal(directiveIndex, target, predicate, flags, read) {
  bindQueryToSignal(target, createContentQuery(directiveIndex, predicate, flags, read));
  return ɵɵcontentQuerySignal;
}
function ɵɵviewQuerySignal(target, predicate, flags, read) {
  bindQueryToSignal(target, createViewQuery(predicate, flags, read));
  return ɵɵviewQuerySignal;
}
function ɵɵqueryAdvance(indexOffset = 1) {
  setCurrentQueryIndex(getCurrentQueryIndex() + indexOffset);
}
function ɵɵreference(index) {
  const contextLView = getContextLView();
  return load(contextLView, HEADER_OFFSET + index);
}
function toTStylingRange(prev, next) {
  ngDevMode && assertNumberInRange(prev, 0, 32767);
  ngDevMode && assertNumberInRange(next, 0, 32767);
  return prev << 17 | next << 2;
}
function getTStylingRangePrev(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return tStylingRange >> 17 & 32767;
}
function getTStylingRangePrevDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return (tStylingRange & 2) == 2;
}
function setTStylingRangePrev(tStylingRange, previous) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  ngDevMode && assertNumberInRange(previous, 0, 32767);
  return tStylingRange & ~4294836224 | previous << 17;
}
function setTStylingRangePrevDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return tStylingRange | 2;
}
function getTStylingRangeNext(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return (tStylingRange & 131068) >> 2;
}
function setTStylingRangeNext(tStylingRange, next) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  ngDevMode && assertNumberInRange(next, 0, 32767);
  return tStylingRange & ~131068 | next << 2;
}
function getTStylingRangeNextDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return (tStylingRange & 1) === 1;
}
function setTStylingRangeNextDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return tStylingRange | 1;
}
function insertTStylingBinding(tData, tNode, tStylingKeyWithStatic, index, isHostBinding, isClassBinding) {
  ngDevMode && assertFirstUpdatePass(getTView());
  let tBindings = isClassBinding ? tNode.classBindings : tNode.styleBindings;
  let tmplHead = getTStylingRangePrev(tBindings);
  let tmplTail = getTStylingRangeNext(tBindings);
  tData[index] = tStylingKeyWithStatic;
  let isKeyDuplicateOfStatic = false;
  let tStylingKey;
  if (Array.isArray(tStylingKeyWithStatic)) {
    const staticKeyValueArray = tStylingKeyWithStatic;
    tStylingKey = staticKeyValueArray[1];
    if (tStylingKey === null || keyValueArrayIndexOf(staticKeyValueArray, tStylingKey) > 0) {
      isKeyDuplicateOfStatic = true;
    }
  } else {
    tStylingKey = tStylingKeyWithStatic;
  }
  if (isHostBinding) {
    const hasTemplateBindings = tmplTail !== 0;
    if (hasTemplateBindings) {
      const previousNode = getTStylingRangePrev(tData[tmplHead + 1]);
      tData[index + 1] = toTStylingRange(previousNode, tmplHead);
      if (previousNode !== 0) {
        tData[previousNode + 1] = setTStylingRangeNext(tData[previousNode + 1], index);
      }
      tData[tmplHead + 1] = setTStylingRangePrev(tData[tmplHead + 1], index);
    } else {
      tData[index + 1] = toTStylingRange(tmplHead, 0);
      if (tmplHead !== 0) {
        tData[tmplHead + 1] = setTStylingRangeNext(tData[tmplHead + 1], index);
      }
      tmplHead = index;
    }
  } else {
    tData[index + 1] = toTStylingRange(tmplTail, 0);
    ngDevMode && assertEqual(tmplHead !== 0 && tmplTail === 0, false, "Adding template bindings after hostBindings is not allowed.");
    if (tmplHead === 0) {
      tmplHead = index;
    } else {
      tData[tmplTail + 1] = setTStylingRangeNext(tData[tmplTail + 1], index);
    }
    tmplTail = index;
  }
  if (isKeyDuplicateOfStatic) {
    tData[index + 1] = setTStylingRangePrevDuplicate(tData[index + 1]);
  }
  markDuplicates(tData, tStylingKey, index, true);
  markDuplicates(tData, tStylingKey, index, false);
  markDuplicateOfResidualStyling(tNode, tStylingKey, tData, index, isClassBinding);
  tBindings = toTStylingRange(tmplHead, tmplTail);
  if (isClassBinding) {
    tNode.classBindings = tBindings;
  } else {
    tNode.styleBindings = tBindings;
  }
}
function markDuplicateOfResidualStyling(tNode, tStylingKey, tData, index, isClassBinding) {
  const residual = isClassBinding ? tNode.residualClasses : tNode.residualStyles;
  if (residual != null && typeof tStylingKey == "string" && keyValueArrayIndexOf(residual, tStylingKey) >= 0) {
    tData[index + 1] = setTStylingRangeNextDuplicate(tData[index + 1]);
  }
}
function markDuplicates(tData, tStylingKey, index, isPrevDir) {
  const tStylingAtIndex = tData[index + 1];
  const isMap = tStylingKey === null;
  let cursor = isPrevDir ? getTStylingRangePrev(tStylingAtIndex) : getTStylingRangeNext(tStylingAtIndex);
  let foundDuplicate = false;
  while (cursor !== 0 && (foundDuplicate === false || isMap)) {
    ngDevMode && assertIndexInRange(tData, cursor);
    const tStylingValueAtCursor = tData[cursor];
    const tStyleRangeAtCursor = tData[cursor + 1];
    if (isStylingMatch(tStylingValueAtCursor, tStylingKey)) {
      foundDuplicate = true;
      tData[cursor + 1] = isPrevDir ? setTStylingRangeNextDuplicate(tStyleRangeAtCursor) : setTStylingRangePrevDuplicate(tStyleRangeAtCursor);
    }
    cursor = isPrevDir ? getTStylingRangePrev(tStyleRangeAtCursor) : getTStylingRangeNext(tStyleRangeAtCursor);
  }
  if (foundDuplicate) {
    tData[index + 1] = isPrevDir ? setTStylingRangePrevDuplicate(tStylingAtIndex) : setTStylingRangeNextDuplicate(tStylingAtIndex);
  }
}
function isStylingMatch(tStylingKeyCursor, tStylingKey) {
  ngDevMode && assertNotEqual(Array.isArray(tStylingKey), true, "Expected that 'tStylingKey' has been unwrapped");
  if (tStylingKeyCursor === null || tStylingKey == null || (Array.isArray(tStylingKeyCursor) ? tStylingKeyCursor[1] : tStylingKeyCursor) === tStylingKey) {
    return true;
  } else if (Array.isArray(tStylingKeyCursor) && typeof tStylingKey === "string") {
    return keyValueArrayIndexOf(tStylingKeyCursor, tStylingKey) >= 0;
  }
  return false;
}
var parserState = {
  textEnd: 0,
  key: 0,
  keyEnd: 0,
  value: 0,
  valueEnd: 0
};
function getLastParsedKey(text) {
  return text.substring(parserState.key, parserState.keyEnd);
}
function getLastParsedValue(text) {
  return text.substring(parserState.value, parserState.valueEnd);
}
function parseClassName(text) {
  resetParserState(text);
  return parseClassNameNext(text, consumeWhitespace(text, 0, parserState.textEnd));
}
function parseClassNameNext(text, index) {
  const end = parserState.textEnd;
  if (end === index) {
    return -1;
  }
  index = parserState.keyEnd = consumeClassToken(text, parserState.key = index, end);
  return consumeWhitespace(text, index, end);
}
function parseStyle(text) {
  resetParserState(text);
  return parseStyleNext(text, consumeWhitespace(text, 0, parserState.textEnd));
}
function parseStyleNext(text, startIndex) {
  const end = parserState.textEnd;
  let index = parserState.key = consumeWhitespace(text, startIndex, end);
  if (end === index) {
    return -1;
  }
  index = parserState.keyEnd = consumeStyleKey(text, index, end);
  index = consumeSeparator(text, index, end, 58);
  index = parserState.value = consumeWhitespace(text, index, end);
  index = parserState.valueEnd = consumeStyleValue(text, index, end);
  return consumeSeparator(text, index, end, 59);
}
function resetParserState(text) {
  parserState.key = 0;
  parserState.keyEnd = 0;
  parserState.value = 0;
  parserState.valueEnd = 0;
  parserState.textEnd = text.length;
}
function consumeWhitespace(text, startIndex, endIndex) {
  while (startIndex < endIndex && text.charCodeAt(startIndex) <= 32) {
    startIndex++;
  }
  return startIndex;
}
function consumeClassToken(text, startIndex, endIndex) {
  while (startIndex < endIndex && text.charCodeAt(startIndex) > 32) {
    startIndex++;
  }
  return startIndex;
}
function consumeStyleKey(text, startIndex, endIndex) {
  let ch;
  while (startIndex < endIndex && ((ch = text.charCodeAt(startIndex)) === 45 || ch === 95 || (ch & -33) >= 65 && (ch & -33) <= 90 || ch >= 48 && ch <= 57)) {
    startIndex++;
  }
  return startIndex;
}
function consumeSeparator(text, startIndex, endIndex, separator) {
  startIndex = consumeWhitespace(text, startIndex, endIndex);
  if (startIndex < endIndex) {
    if (ngDevMode && text.charCodeAt(startIndex) !== separator) {
      malformedStyleError(text, String.fromCharCode(separator), startIndex);
    }
    startIndex++;
  }
  return startIndex;
}
function consumeStyleValue(text, startIndex, endIndex) {
  let ch1 = -1;
  let ch2 = -1;
  let ch3 = -1;
  let i = startIndex;
  let lastChIndex = i;
  while (i < endIndex) {
    const ch = text.charCodeAt(i++);
    if (ch === 59) {
      return lastChIndex;
    } else if (ch === 34 || ch === 39) {
      lastChIndex = i = consumeQuotedText(text, ch, i, endIndex);
    } else if (startIndex === i - 4 && ch3 === 85 && ch2 === 82 && ch1 === 76 && ch === 40) {
      lastChIndex = i = consumeQuotedText(text, 41, i, endIndex);
    } else if (ch > 32) {
      lastChIndex = i;
    }
    ch3 = ch2;
    ch2 = ch1;
    ch1 = ch & -33;
  }
  return lastChIndex;
}
function consumeQuotedText(text, quoteCharCode, startIndex, endIndex) {
  let ch1 = -1;
  let index = startIndex;
  while (index < endIndex) {
    const ch = text.charCodeAt(index++);
    if (ch == quoteCharCode && ch1 !== 92) {
      return index;
    }
    if (ch == 92 && ch1 === 92) {
      ch1 = 0;
    } else {
      ch1 = ch;
    }
  }
  throw ngDevMode ? malformedStyleError(text, String.fromCharCode(quoteCharCode), endIndex) : new Error();
}
function malformedStyleError(text, expecting, index) {
  ngDevMode && assertEqual(typeof text === "string", true, "String expected here");
  throw throwError(`Malformed style at location ${index} in string '` + text.substring(0, index) + "[>>" + text.substring(index, index + 1) + "<<]" + text.slice(index + 1) + `'. Expecting '${expecting}'.`);
}
function ɵɵstyleProp(prop, value, suffix) {
  checkStylingProperty(prop, value, suffix, false);
  return ɵɵstyleProp;
}
function ɵɵclassProp(className, value) {
  checkStylingProperty(className, value, null, true);
  return ɵɵclassProp;
}
function ɵɵstyleMap(styles) {
  checkStylingMap(styleKeyValueArraySet, styleStringParser, styles, false);
}
function styleStringParser(keyValueArray, text) {
  for (let i = parseStyle(text); i >= 0; i = parseStyleNext(text, i)) {
    styleKeyValueArraySet(keyValueArray, getLastParsedKey(text), getLastParsedValue(text));
  }
}
function ɵɵclassMap(classes) {
  checkStylingMap(classKeyValueArraySet, classStringParser, classes, true);
}
function classStringParser(keyValueArray, text) {
  for (let i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
    keyValueArraySet(keyValueArray, getLastParsedKey(text), true);
  }
}
function checkStylingProperty(prop, value, suffix, isClassBased) {
  const lView = getLView();
  const tView = getTView();
  const bindingIndex = incrementBindingIndex(2);
  if (tView.firstUpdatePass) {
    stylingFirstUpdatePass(tView, prop, bindingIndex, isClassBased);
  }
  if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
    const tNode = tView.data[getSelectedIndex()];
    updateStyling(tView, tNode, lView, lView[RENDERER], prop, lView[bindingIndex + 1] = normalizeSuffix(value, suffix), isClassBased, bindingIndex);
  }
}
function checkStylingMap(keyValueArraySet2, stringParser, value, isClassBased) {
  const tView = getTView();
  const bindingIndex = incrementBindingIndex(2);
  if (tView.firstUpdatePass) {
    stylingFirstUpdatePass(tView, null, bindingIndex, isClassBased);
  }
  const lView = getLView();
  if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
    const tNode = tView.data[getSelectedIndex()];
    if (hasStylingInputShadow(tNode, isClassBased) && !isInHostBindings(tView, bindingIndex)) {
      if (ngDevMode) {
        const tStylingKey = tView.data[bindingIndex];
        assertEqual(Array.isArray(tStylingKey) ? tStylingKey[1] : tStylingKey, false, "Styling linked list shadow input should be marked as 'false'");
      }
      let staticPrefix = isClassBased ? tNode.classesWithoutHost : tNode.stylesWithoutHost;
      ngDevMode && isClassBased === false && staticPrefix !== null && assertEqual(staticPrefix.endsWith(";"), true, "Expecting static portion to end with ';'");
      if (staticPrefix !== null) {
        value = concatStringsWithSpace(staticPrefix, value ? value : "");
      }
      setDirectiveInputsWhichShadowsStyling(tView, tNode, lView, value, isClassBased);
    } else {
      updateStylingMap(tView, tNode, lView, lView[RENDERER], lView[bindingIndex + 1], lView[bindingIndex + 1] = toStylingKeyValueArray(keyValueArraySet2, stringParser, value), isClassBased, bindingIndex);
    }
  }
}
function isInHostBindings(tView, bindingIndex) {
  return bindingIndex >= tView.expandoStartIndex;
}
function stylingFirstUpdatePass(tView, tStylingKey, bindingIndex, isClassBased) {
  ngDevMode && assertFirstUpdatePass(tView);
  const tData = tView.data;
  if (tData[bindingIndex + 1] === null) {
    const tNode = tData[getSelectedIndex()];
    ngDevMode && assertDefined(tNode, "TNode expected");
    const isHostBindings = isInHostBindings(tView, bindingIndex);
    if (hasStylingInputShadow(tNode, isClassBased) && tStylingKey === null && !isHostBindings) {
      tStylingKey = false;
    }
    tStylingKey = wrapInStaticStylingKey(tData, tNode, tStylingKey, isClassBased);
    insertTStylingBinding(tData, tNode, tStylingKey, bindingIndex, isHostBindings, isClassBased);
  }
}
function wrapInStaticStylingKey(tData, tNode, stylingKey, isClassBased) {
  const hostDirectiveDef = getCurrentDirectiveDef(tData);
  let residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
  if (hostDirectiveDef === null) {
    const isFirstStylingInstructionInTemplate = (isClassBased ? tNode.classBindings : tNode.styleBindings) === 0;
    if (isFirstStylingInstructionInTemplate) {
      stylingKey = collectStylingFromDirectives(null, tData, tNode, stylingKey, isClassBased);
      stylingKey = collectStylingFromTAttrs(stylingKey, tNode.attrs, isClassBased);
      residual = null;
    }
  } else {
    const directiveStylingLast = tNode.directiveStylingLast;
    const isFirstStylingInstructionInHostBinding = directiveStylingLast === -1 || tData[directiveStylingLast] !== hostDirectiveDef;
    if (isFirstStylingInstructionInHostBinding) {
      stylingKey = collectStylingFromDirectives(hostDirectiveDef, tData, tNode, stylingKey, isClassBased);
      if (residual === null) {
        let templateStylingKey = getTemplateHeadTStylingKey(tData, tNode, isClassBased);
        if (templateStylingKey !== void 0 && Array.isArray(templateStylingKey)) {
          templateStylingKey = collectStylingFromDirectives(null, tData, tNode, templateStylingKey[1], isClassBased);
          templateStylingKey = collectStylingFromTAttrs(templateStylingKey, tNode.attrs, isClassBased);
          setTemplateHeadTStylingKey(tData, tNode, isClassBased, templateStylingKey);
        }
      } else {
        residual = collectResidual(tData, tNode, isClassBased);
      }
    }
  }
  if (residual !== void 0) {
    isClassBased ? tNode.residualClasses = residual : tNode.residualStyles = residual;
  }
  return stylingKey;
}
function getTemplateHeadTStylingKey(tData, tNode, isClassBased) {
  const bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
  if (getTStylingRangeNext(bindings) === 0) {
    return void 0;
  }
  return tData[getTStylingRangePrev(bindings)];
}
function setTemplateHeadTStylingKey(tData, tNode, isClassBased, tStylingKey) {
  const bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
  ngDevMode && assertNotEqual(getTStylingRangeNext(bindings), 0, "Expecting to have at least one template styling binding.");
  tData[getTStylingRangePrev(bindings)] = tStylingKey;
}
function collectResidual(tData, tNode, isClassBased) {
  let residual = void 0;
  const directiveEnd = tNode.directiveEnd;
  ngDevMode && assertNotEqual(tNode.directiveStylingLast, -1, "By the time this function gets called at least one hostBindings-node styling instruction must have executed.");
  for (let i = 1 + tNode.directiveStylingLast; i < directiveEnd; i++) {
    const attrs = tData[i].hostAttrs;
    residual = collectStylingFromTAttrs(residual, attrs, isClassBased);
  }
  return collectStylingFromTAttrs(residual, tNode.attrs, isClassBased);
}
function collectStylingFromDirectives(hostDirectiveDef, tData, tNode, stylingKey, isClassBased) {
  let currentDirective = null;
  const directiveEnd = tNode.directiveEnd;
  let directiveStylingLast = tNode.directiveStylingLast;
  if (directiveStylingLast === -1) {
    directiveStylingLast = tNode.directiveStart;
  } else {
    directiveStylingLast++;
  }
  while (directiveStylingLast < directiveEnd) {
    currentDirective = tData[directiveStylingLast];
    ngDevMode && assertDefined(currentDirective, "expected to be defined");
    stylingKey = collectStylingFromTAttrs(stylingKey, currentDirective.hostAttrs, isClassBased);
    if (currentDirective === hostDirectiveDef) break;
    directiveStylingLast++;
  }
  if (hostDirectiveDef !== null) {
    tNode.directiveStylingLast = directiveStylingLast;
  }
  return stylingKey;
}
function collectStylingFromTAttrs(stylingKey, attrs, isClassBased) {
  const desiredMarker = isClassBased ? 1 : 2;
  let currentMarker = -1;
  if (attrs !== null) {
    for (let i = 0; i < attrs.length; i++) {
      const item = attrs[i];
      if (typeof item === "number") {
        currentMarker = item;
      } else {
        if (currentMarker === desiredMarker) {
          if (!Array.isArray(stylingKey)) {
            stylingKey = stylingKey === void 0 ? [] : ["", stylingKey];
          }
          keyValueArraySet(stylingKey, item, isClassBased ? true : attrs[++i]);
        }
      }
    }
  }
  return stylingKey === void 0 ? null : stylingKey;
}
function toStylingKeyValueArray(keyValueArraySet2, stringParser, value) {
  if (value == null || value === "") return EMPTY_ARRAY;
  const styleKeyValueArray = [];
  const unwrappedValue = unwrapSafeValue(value);
  if (Array.isArray(unwrappedValue)) {
    for (let i = 0; i < unwrappedValue.length; i++) {
      keyValueArraySet2(styleKeyValueArray, unwrappedValue[i], true);
    }
  } else if (unwrappedValue instanceof Set) {
    for (const current of unwrappedValue) {
      keyValueArraySet2(styleKeyValueArray, current, true);
    }
  } else if (typeof unwrappedValue === "object") {
    for (const key in unwrappedValue) {
      if (unwrappedValue.hasOwnProperty(key)) {
        keyValueArraySet2(styleKeyValueArray, key, unwrappedValue[key]);
      }
    }
  } else if (typeof unwrappedValue === "string") {
    stringParser(styleKeyValueArray, unwrappedValue);
  } else {
    ngDevMode && throwError("Unsupported styling type: " + typeof unwrappedValue + " (" + unwrappedValue + ")");
  }
  return styleKeyValueArray;
}
function styleKeyValueArraySet(keyValueArray, key, value) {
  keyValueArraySet(keyValueArray, key, unwrapSafeValue(value));
}
function classKeyValueArraySet(keyValueArray, key, value) {
  const stringKey = String(key);
  if (stringKey !== "" && !stringKey.includes(" ")) {
    keyValueArraySet(keyValueArray, stringKey, value);
  }
}
function updateStylingMap(tView, tNode, lView, renderer, oldKeyValueArray, newKeyValueArray, isClassBased, bindingIndex) {
  if (oldKeyValueArray === NO_CHANGE) {
    oldKeyValueArray = EMPTY_ARRAY;
  }
  let oldIndex = 0;
  let newIndex = 0;
  let oldKey = 0 < oldKeyValueArray.length ? oldKeyValueArray[0] : null;
  let newKey = 0 < newKeyValueArray.length ? newKeyValueArray[0] : null;
  while (oldKey !== null || newKey !== null) {
    ngDevMode && assertLessThan(oldIndex, 999, "Are we stuck in infinite loop?");
    ngDevMode && assertLessThan(newIndex, 999, "Are we stuck in infinite loop?");
    const oldValue = oldIndex < oldKeyValueArray.length ? oldKeyValueArray[oldIndex + 1] : void 0;
    const newValue = newIndex < newKeyValueArray.length ? newKeyValueArray[newIndex + 1] : void 0;
    let setKey = null;
    let setValue = void 0;
    if (oldKey === newKey) {
      oldIndex += 2;
      newIndex += 2;
      if (oldValue !== newValue) {
        setKey = newKey;
        setValue = newValue;
      }
    } else if (newKey === null || oldKey !== null && oldKey < newKey) {
      oldIndex += 2;
      setKey = oldKey;
    } else {
      ngDevMode && assertDefined(newKey, "Expecting to have a valid key");
      newIndex += 2;
      setKey = newKey;
      setValue = newValue;
    }
    if (setKey !== null) {
      updateStyling(tView, tNode, lView, renderer, setKey, setValue, isClassBased, bindingIndex);
    }
    oldKey = oldIndex < oldKeyValueArray.length ? oldKeyValueArray[oldIndex] : null;
    newKey = newIndex < newKeyValueArray.length ? newKeyValueArray[newIndex] : null;
  }
}
function updateStyling(tView, tNode, lView, renderer, prop, value, isClassBased, bindingIndex) {
  if (!(tNode.type & 3)) {
    return;
  }
  const tData = tView.data;
  const tRange = tData[bindingIndex + 1];
  const higherPriorityValue = getTStylingRangeNextDuplicate(tRange) ? findStylingValue(tData, tNode, lView, prop, getTStylingRangeNext(tRange), isClassBased) : void 0;
  if (!isStylingValuePresent(higherPriorityValue)) {
    if (!isStylingValuePresent(value)) {
      if (getTStylingRangePrevDuplicate(tRange)) {
        value = findStylingValue(tData, null, lView, prop, bindingIndex, isClassBased);
      }
    }
    const rNode = getNativeByIndex(getSelectedIndex(), lView);
    applyStyling(renderer, isClassBased, rNode, prop, value);
  }
}
function findStylingValue(tData, tNode, lView, prop, index, isClassBased) {
  const isPrevDirection = tNode === null;
  let value = void 0;
  while (index > 0) {
    const rawKey = tData[index];
    const containsStatics = Array.isArray(rawKey);
    const key = containsStatics ? rawKey[1] : rawKey;
    const isStylingMap = key === null;
    let valueAtLViewIndex = lView[index + 1];
    if (valueAtLViewIndex === NO_CHANGE) {
      valueAtLViewIndex = isStylingMap ? EMPTY_ARRAY : void 0;
    }
    let currentValue = isStylingMap ? keyValueArrayGet(valueAtLViewIndex, prop) : key === prop ? valueAtLViewIndex : void 0;
    if (containsStatics && !isStylingValuePresent(currentValue)) {
      currentValue = keyValueArrayGet(rawKey, prop);
    }
    if (isStylingValuePresent(currentValue)) {
      value = currentValue;
      if (isPrevDirection) {
        return value;
      }
    }
    const tRange = tData[index + 1];
    index = isPrevDirection ? getTStylingRangePrev(tRange) : getTStylingRangeNext(tRange);
  }
  if (tNode !== null) {
    let residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
    if (residual != null) {
      value = keyValueArrayGet(residual, prop);
    }
  }
  return value;
}
function isStylingValuePresent(value) {
  return value !== void 0;
}
function normalizeSuffix(value, suffix) {
  if (value == null || value === "") ;
  else if (typeof suffix === "string") {
    value = value + suffix;
  } else if (typeof value === "object") {
    value = stringify(unwrapSafeValue(value));
  }
  return value;
}
function hasStylingInputShadow(tNode, isClassBased) {
  return (tNode.flags & (isClassBased ? 8 : 16)) !== 0;
}
function ɵɵtext(index, value = "") {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;
  ngDevMode && assertTNodeCreationIndex(lView, index);
  const tNode = tView.firstCreatePass ? getOrCreateTNode(tView, adjustedIndex, 1, value, null) : tView.data[adjustedIndex];
  const textNative = _locateOrCreateTextNode(tView, lView, tNode, value);
  lView[adjustedIndex] = textNative;
  if (wasLastNodeCreated()) {
    appendChild(tView, lView, textNative, tNode);
  }
  setCurrentTNode(tNode, false);
}
var _locateOrCreateTextNode = (tView, lView, tNode, value) => {
  lastNodeWasCreated(true);
  return createTextNode(lView[RENDERER], value);
};
function locateOrCreateTextNodeImpl(tView, lView, tNode, value) {
  const isNodeCreationMode = !canHydrateNode(lView, tNode);
  lastNodeWasCreated(isNodeCreationMode);
  if (isNodeCreationMode) {
    return createTextNode(lView[RENDERER], value);
  }
  const hydrationInfo = lView[HYDRATION];
  const textNative = locateNextRNode(hydrationInfo, tView, lView, tNode);
  ngDevMode && validateMatchingNode(textNative, Node.TEXT_NODE, null, lView, tNode);
  ngDevMode && markRNodeAsClaimedByHydration(textNative);
  return textNative;
}
function enableLocateOrCreateTextNodeImpl() {
  _locateOrCreateTextNode = locateOrCreateTextNodeImpl;
}
function interpolationV(lView, values) {
  ngDevMode && assertLessThan(2, values.length, "should have at least 3 values");
  let isBindingUpdated = false;
  let bindingIndex = getBindingIndex();
  for (let i = 1; i < values.length; i += 2) {
    isBindingUpdated = bindingUpdated(lView, bindingIndex++, values[i]) || isBindingUpdated;
  }
  setBindingIndex(bindingIndex);
  if (!isBindingUpdated) {
    return NO_CHANGE;
  }
  let content = values[0];
  for (let i = 1; i < values.length; i += 2) {
    content += renderStringify(values[i]) + (i + 1 !== values.length ? values[i + 1] : "");
  }
  return content;
}
function interpolation1(lView, prefix, v0, suffix = "") {
  const different = bindingUpdated(lView, nextBindingIndex(), v0);
  return different ? prefix + renderStringify(v0) + suffix : NO_CHANGE;
}
function interpolation2(lView, prefix, v0, i0, v1, suffix = "") {
  const bindingIndex = getBindingIndex();
  const different = bindingUpdated2(lView, bindingIndex, v0, v1);
  incrementBindingIndex(2);
  return different ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + suffix : NO_CHANGE;
}
function interpolation3(lView, prefix, v0, i0, v1, i1, v2, suffix = "") {
  const bindingIndex = getBindingIndex();
  const different = bindingUpdated3(lView, bindingIndex, v0, v1, v2);
  incrementBindingIndex(3);
  return different ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + suffix : NO_CHANGE;
}
function interpolation4(lView, prefix, v0, i0, v1, i1, v2, i2, v3, suffix = "") {
  const bindingIndex = getBindingIndex();
  const different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  incrementBindingIndex(4);
  return different ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 + renderStringify(v3) + suffix : NO_CHANGE;
}
function interpolation5(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, suffix = "") {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated(lView, bindingIndex + 4, v4) || different;
  incrementBindingIndex(5);
  return different ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 + renderStringify(v3) + i3 + renderStringify(v4) + suffix : NO_CHANGE;
}
function interpolation6(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix = "") {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated2(lView, bindingIndex + 4, v4, v5) || different;
  incrementBindingIndex(6);
  return different ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 + renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + suffix : NO_CHANGE;
}
function interpolation7(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix = "") {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated3(lView, bindingIndex + 4, v4, v5, v6) || different;
  incrementBindingIndex(7);
  return different ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 + renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + i5 + renderStringify(v6) + suffix : NO_CHANGE;
}
function interpolation8(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix = "") {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated4(lView, bindingIndex + 4, v4, v5, v6, v7) || different;
  incrementBindingIndex(8);
  return different ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 + renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + i5 + renderStringify(v6) + i6 + renderStringify(v7) + suffix : NO_CHANGE;
}
function ɵɵtextInterpolate(v0) {
  ɵɵtextInterpolate1("", v0);
  return ɵɵtextInterpolate;
}
function ɵɵtextInterpolate1(prefix, v0, suffix) {
  const lView = getLView();
  const interpolated = interpolation1(lView, prefix, v0, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate1;
}
function ɵɵtextInterpolate2(prefix, v0, i0, v1, suffix) {
  const lView = getLView();
  const interpolated = interpolation2(lView, prefix, v0, i0, v1, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate2;
}
function ɵɵtextInterpolate3(prefix, v0, i0, v1, i1, v2, suffix) {
  const lView = getLView();
  const interpolated = interpolation3(lView, prefix, v0, i0, v1, i1, v2, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate3;
}
function ɵɵtextInterpolate4(prefix, v0, i0, v1, i1, v2, i2, v3, suffix) {
  const lView = getLView();
  const interpolated = interpolation4(lView, prefix, v0, i0, v1, i1, v2, i2, v3, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate4;
}
function ɵɵtextInterpolate5(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, suffix) {
  const lView = getLView();
  const interpolated = interpolation5(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate5;
}
function ɵɵtextInterpolate6(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix) {
  const lView = getLView();
  const interpolated = interpolation6(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate6;
}
function ɵɵtextInterpolate7(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix) {
  const lView = getLView();
  const interpolated = interpolation7(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate7;
}
function ɵɵtextInterpolate8(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix) {
  const lView = getLView();
  const interpolated = interpolation8(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate8;
}
function ɵɵtextInterpolateV(values) {
  const lView = getLView();
  const interpolated = interpolationV(lView, values);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolateV;
}
function textBindingInternal(lView, index, value) {
  ngDevMode && assertString(value, "Value should be a string");
  ngDevMode && assertNotSame(value, NO_CHANGE, "value should not be NO_CHANGE");
  ngDevMode && assertIndexInRange(lView, index);
  const element = getNativeByIndex(index, lView);
  ngDevMode && assertDefined(element, "native element should exist");
  updateTextNode(lView[RENDERER], element, value);
}
function ɵɵtwoWayProperty(propName, value, sanitizer) {
  if (isWritableSignal(value)) {
    value = value();
  }
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    setPropertyAndInputs(tNode, lView, propName, value, lView[RENDERER], sanitizer);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
  }
  return ɵɵtwoWayProperty;
}
function ɵɵtwoWayBindingSet(target, value) {
  const canWrite = isWritableSignal(target);
  canWrite && target.set(value);
  return canWrite;
}
function ɵɵtwoWayListener(eventName, listenerFn) {
  const lView = getLView();
  const tView = getTView();
  const tNode = getCurrentTNode();
  listenerInternal(tView, lView, lView[RENDERER], tNode, eventName, listenerFn);
  return ɵɵtwoWayListener;
}
var UNINITIALIZED_LET = {};
function ɵɵdeclareLet(index) {
  performanceMarkFeature("NgLet");
  const tView = getTView();
  const lView = getLView();
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = getOrCreateTNode(tView, adjustedIndex, 128, null, null);
  setCurrentTNode(tNode, false);
  store(tView, lView, adjustedIndex, UNINITIALIZED_LET);
  return ɵɵdeclareLet;
}
function ɵɵstoreLet(value) {
  const tView = getTView();
  const lView = getLView();
  const index = getSelectedIndex();
  store(tView, lView, index, value);
  return value;
}
function ɵɵreadContextLet(index) {
  const contextLView = getContextLView();
  const value = load(contextLView, HEADER_OFFSET + index);
  if (value === UNINITIALIZED_LET) {
    throw new RuntimeError(314, ngDevMode && "Attempting to access a @let declaration whose value is not available yet");
  }
  return value;
}
function ɵɵattachSourceLocations(templatePath, locations) {
  const tView = getTView();
  const lView = getLView();
  const renderer = lView[RENDERER];
  const attributeName2 = "data-ng-source-location";
  for (const [index, offset, line, column] of locations) {
    const tNode = getTNode(tView, index + HEADER_OFFSET);
    ngDevMode && assertTNodeType(tNode, 2);
    const node = getNativeByIndex(index + HEADER_OFFSET, lView);
    if (!node.hasAttribute(attributeName2)) {
      const attributeValue = `${templatePath}@o:${offset},l:${line},c:${column}`;
      renderer.setAttribute(node, attributeName2, attributeValue);
    }
  }
}
function ɵɵinterpolate(v0) {
  return bindingUpdated(getLView(), nextBindingIndex(), v0) ? renderStringify(v0) : NO_CHANGE;
}
function ɵɵinterpolate1(prefix, v0, suffix = "") {
  return interpolation1(getLView(), prefix, v0, suffix);
}
function ɵɵinterpolate2(prefix, v0, i0, v1, suffix = "") {
  return interpolation2(getLView(), prefix, v0, i0, v1, suffix);
}
function ɵɵinterpolate3(prefix, v0, i0, v1, i1, v2, suffix = "") {
  return interpolation3(getLView(), prefix, v0, i0, v1, i1, v2, suffix);
}
function ɵɵinterpolate4(prefix, v0, i0, v1, i1, v2, i2, v3, suffix = "") {
  return interpolation4(getLView(), prefix, v0, i0, v1, i1, v2, i2, v3, suffix);
}
function ɵɵinterpolate5(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, suffix = "") {
  return interpolation5(getLView(), prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, suffix);
}
function ɵɵinterpolate6(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix = "") {
  return interpolation6(getLView(), prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
}
function ɵɵinterpolate7(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix = "") {
  return interpolation7(getLView(), prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix);
}
function ɵɵinterpolate8(prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix = "") {
  return interpolation8(getLView(), prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix);
}
function ɵɵinterpolateV(values) {
  return interpolationV(getLView(), values);
}
function providersResolver(def, providers, isViewProviders) {
  const tView = getTView();
  if (tView.firstCreatePass) {
    resolveProvider(providers, tView.data, tView.blueprint, isComponentDef(def), isViewProviders);
  }
}
function resolveProvider(provider, tInjectables, lInjectablesBlueprint, isComponent2, isViewProvider) {
  provider = resolveForwardRef(provider);
  if (Array.isArray(provider)) {
    for (let i = 0; i < provider.length; i++) {
      resolveProvider(provider[i], tInjectables, lInjectablesBlueprint, isComponent2, isViewProvider);
    }
  } else {
    const tView = getTView();
    const lView = getLView();
    const tNode = getCurrentTNode();
    let token = isTypeProvider(provider) ? provider : resolveForwardRef(provider.provide);
    const providerFactory = providerToFactory(provider);
    if (ngDevMode) {
      const injector = new NodeInjector(tNode, lView);
      runInInjectorProfilerContext(injector, token, () => {
        emitProviderConfiguredEvent(provider, isViewProvider);
      });
    }
    const beginIndex = tNode.providerIndexes & 1048575;
    const endIndex = tNode.directiveStart;
    const cptViewProvidersCount = tNode.providerIndexes >> 20;
    if (isTypeProvider(provider) || !provider.multi) {
      const factory = new NodeInjectorFactory(providerFactory, isViewProvider, ɵɵdirectiveInject, ngDevMode ? providerName(provider) : null);
      const existingFactoryIndex = indexOf(token, tInjectables, isViewProvider ? beginIndex : beginIndex + cptViewProvidersCount, endIndex);
      if (existingFactoryIndex === -1) {
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, token);
        registerDestroyHooksIfSupported(tView, provider, tInjectables.length);
        tInjectables.push(token);
        tNode.directiveStart++;
        tNode.directiveEnd++;
        if (isViewProvider) {
          tNode.providerIndexes += 1048576;
        }
        lInjectablesBlueprint.push(factory);
        lView.push(factory);
      } else {
        lInjectablesBlueprint[existingFactoryIndex] = factory;
        lView[existingFactoryIndex] = factory;
      }
    } else {
      const existingProvidersFactoryIndex = indexOf(token, tInjectables, beginIndex + cptViewProvidersCount, endIndex);
      const existingViewProvidersFactoryIndex = indexOf(token, tInjectables, beginIndex, beginIndex + cptViewProvidersCount);
      const doesProvidersFactoryExist = existingProvidersFactoryIndex >= 0 && lInjectablesBlueprint[existingProvidersFactoryIndex];
      const doesViewProvidersFactoryExist = existingViewProvidersFactoryIndex >= 0 && lInjectablesBlueprint[existingViewProvidersFactoryIndex];
      if (isViewProvider && !doesViewProvidersFactoryExist || !isViewProvider && !doesProvidersFactoryExist) {
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, token);
        const factory = multiFactory(isViewProvider ? multiViewProvidersFactoryResolver : multiProvidersFactoryResolver, lInjectablesBlueprint.length, isViewProvider, isComponent2, providerFactory, provider);
        if (!isViewProvider && doesViewProvidersFactoryExist) {
          lInjectablesBlueprint[existingViewProvidersFactoryIndex].providerFactory = factory;
        }
        registerDestroyHooksIfSupported(tView, provider, tInjectables.length, 0);
        tInjectables.push(token);
        tNode.directiveStart++;
        tNode.directiveEnd++;
        if (isViewProvider) {
          tNode.providerIndexes += 1048576;
        }
        lInjectablesBlueprint.push(factory);
        lView.push(factory);
      } else {
        const indexInFactory = multiFactoryAdd(lInjectablesBlueprint[isViewProvider ? existingViewProvidersFactoryIndex : existingProvidersFactoryIndex], providerFactory, !isViewProvider && isComponent2);
        registerDestroyHooksIfSupported(tView, provider, existingProvidersFactoryIndex > -1 ? existingProvidersFactoryIndex : existingViewProvidersFactoryIndex, indexInFactory);
      }
      if (!isViewProvider && isComponent2 && doesViewProvidersFactoryExist) {
        lInjectablesBlueprint[existingViewProvidersFactoryIndex].componentProviders++;
      }
    }
  }
}
function registerDestroyHooksIfSupported(tView, provider, contextIndex, indexInFactory) {
  const providerIsTypeProvider = isTypeProvider(provider);
  const providerIsClassProvider = isClassProvider(provider);
  if (providerIsTypeProvider || providerIsClassProvider) {
    const classToken = providerIsClassProvider ? resolveForwardRef(provider.useClass) : provider;
    const prototype = classToken.prototype;
    const ngOnDestroy = prototype.ngOnDestroy;
    if (ngOnDestroy) {
      const hooks = tView.destroyHooks || (tView.destroyHooks = []);
      if (!providerIsTypeProvider && provider.multi) {
        ngDevMode && assertDefined(indexInFactory, "indexInFactory when registering multi factory destroy hook");
        const existingCallbacksIndex = hooks.indexOf(contextIndex);
        if (existingCallbacksIndex === -1) {
          hooks.push(contextIndex, [indexInFactory, ngOnDestroy]);
        } else {
          hooks[existingCallbacksIndex + 1].push(indexInFactory, ngOnDestroy);
        }
      } else {
        hooks.push(contextIndex, ngOnDestroy);
      }
    }
  }
}
function multiFactoryAdd(multiFactory2, factory, isComponentProvider) {
  if (isComponentProvider) {
    multiFactory2.componentProviders++;
  }
  return multiFactory2.multi.push(factory) - 1;
}
function indexOf(item, arr, begin, end) {
  for (let i = begin; i < end; i++) {
    if (arr[i] === item) return i;
  }
  return -1;
}
function multiProvidersFactoryResolver(_, flags, tData, lData, tNode) {
  return multiResolve(this.multi, []);
}
function multiViewProvidersFactoryResolver(_, _flags, _tData, lView, tNode) {
  const factories = this.multi;
  let result;
  if (this.providerFactory) {
    const componentCount = this.providerFactory.componentProviders;
    const multiProviders = getNodeInjectable(lView, lView[TVIEW], this.providerFactory.index, tNode);
    result = multiProviders.slice(0, componentCount);
    multiResolve(factories, result);
    for (let i = componentCount; i < multiProviders.length; i++) {
      result.push(multiProviders[i]);
    }
  } else {
    result = [];
    multiResolve(factories, result);
  }
  return result;
}
function multiResolve(factories, result) {
  for (let i = 0; i < factories.length; i++) {
    const factory = factories[i];
    result.push(factory());
  }
  return result;
}
function multiFactory(factoryFn, index, isViewProvider, isComponent2, f, provider) {
  const factory = new NodeInjectorFactory(factoryFn, isViewProvider, ɵɵdirectiveInject, ngDevMode ? providerName(provider) : null);
  factory.multi = [];
  factory.index = index;
  factory.componentProviders = 0;
  multiFactoryAdd(factory, f, isComponent2 && !isViewProvider);
  return factory;
}
function providerName(provider) {
  if (Array.isArray(provider)) {
    return null;
  }
  if (isTypeProvider(provider)) {
    return provider.name;
  } else if (isClassProvider(provider)) {
    if (provider.provide instanceof InjectionToken) {
      return `('${provider.provide.toString()}':${provider.useClass.name})`;
    }
    return provider.useClass.name;
  } else if (provider.provide instanceof InjectionToken) {
    return provider.provide.toString();
  } else if (typeof provider.provide === "string") {
    return provider.provide;
  } else {
    return null;
  }
}
function ɵɵProvidersFeature(providers, viewProviders) {
  return (definition) => {
    definition.providersResolver = (def, processProvidersFn) => providersResolver(def, processProvidersFn ? processProvidersFn(providers) : providers, false);
    if (viewProviders) {
      definition.viewProvidersResolver = (def, processProvidersFn) => providersResolver(def, processProvidersFn ? processProvidersFn(viewProviders) : viewProviders, true);
    }
  };
}
function ɵɵExternalStylesFeature(styleUrls) {
  return (definition) => {
    if (styleUrls.length < 1) {
      return;
    }
    definition.getExternalStyles = (encapsulationId) => {
      const urls = styleUrls.map((value) => value + "?ngcomp" + (encapsulationId ? "=" + encodeURIComponent(encapsulationId) : "") + "&e=" + definition.encapsulation);
      return urls;
    };
  };
}
function ɵɵsetComponentScope(type, directives, pipes) {
  const def = type.ɵcmp;
  def.directiveDefs = extractDefListOrFactory(directives, extractDirectiveDef);
  def.pipeDefs = extractDefListOrFactory(pipes, getPipeDef);
}
function ɵɵsetNgModuleScope(type, scope) {
  return noSideEffects(() => {
    const ngModuleDef = getNgModuleDefOrThrow(type);
    ngModuleDef.declarations = convertToTypeArray(scope.declarations || EMPTY_ARRAY);
    ngModuleDef.imports = convertToTypeArray(scope.imports || EMPTY_ARRAY);
    ngModuleDef.exports = convertToTypeArray(scope.exports || EMPTY_ARRAY);
    if (scope.bootstrap) {
      ngModuleDef.bootstrap = convertToTypeArray(scope.bootstrap);
    }
    depsTracker.registerNgModule(type, scope);
  });
}
function convertToTypeArray(values) {
  if (typeof values === "function") {
    return values;
  }
  const flattenValues = flatten(values);
  if (flattenValues.some(isForwardRef)) {
    return () => flattenValues.map(resolveForwardRef).map(maybeUnwrapModuleWithProviders);
  } else {
    return flattenValues.map(maybeUnwrapModuleWithProviders);
  }
}
function maybeUnwrapModuleWithProviders(value) {
  return isModuleWithProviders(value) ? value.ngModule : value;
}
function ɵɵpureFunction0(slotOffset, pureFn) {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  return lView[bindingIndex] === NO_CHANGE ? updateBinding(lView, bindingIndex, pureFn()) : getBinding(lView, bindingIndex);
}
function ɵɵpureFunction1(slotOffset, pureFn, exp) {
  return pureFunction1Internal(getLView(), getBindingRoot(), slotOffset, pureFn, exp);
}
function ɵɵpureFunction2(slotOffset, pureFn, exp1, exp2) {
  return pureFunction2Internal(getLView(), getBindingRoot(), slotOffset, pureFn, exp1, exp2);
}
function ɵɵpureFunction3(slotOffset, pureFn, exp1, exp2, exp3) {
  return pureFunction3Internal(getLView(), getBindingRoot(), slotOffset, pureFn, exp1, exp2, exp3);
}
function ɵɵpureFunction4(slotOffset, pureFn, exp1, exp2, exp3, exp4, thisArg) {
  return pureFunction4Internal(getLView(), getBindingRoot(), slotOffset, pureFn, exp1, exp2, exp3, exp4);
}
function ɵɵpureFunction5(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5) {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated(lView, bindingIndex + 4, exp5) || different ? updateBinding(lView, bindingIndex + 5, pureFn(exp1, exp2, exp3, exp4, exp5)) : getBinding(lView, bindingIndex + 5);
}
function ɵɵpureFunction6(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5, exp6) {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated2(lView, bindingIndex + 4, exp5, exp6) || different ? updateBinding(lView, bindingIndex + 6, pureFn(exp1, exp2, exp3, exp4, exp5, exp6)) : getBinding(lView, bindingIndex + 6);
}
function ɵɵpureFunction7(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5, exp6, exp7) {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  let different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated3(lView, bindingIndex + 4, exp5, exp6, exp7) || different ? updateBinding(lView, bindingIndex + 7, pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7)) : getBinding(lView, bindingIndex + 7);
}
function ɵɵpureFunction8(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8) {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated4(lView, bindingIndex + 4, exp5, exp6, exp7, exp8) || different ? updateBinding(lView, bindingIndex + 8, pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8)) : getBinding(lView, bindingIndex + 8);
}
function ɵɵpureFunctionV(slotOffset, pureFn, exps) {
  return pureFunctionVInternal(getLView(), getBindingRoot(), slotOffset, pureFn, exps);
}
function getPureFunctionReturnValue(lView, returnValueIndex) {
  ngDevMode && assertIndexInRange(lView, returnValueIndex);
  const lastReturnValue = lView[returnValueIndex];
  return lastReturnValue === NO_CHANGE ? void 0 : lastReturnValue;
}
function pureFunction1Internal(lView, bindingRoot, slotOffset, pureFn, exp, thisArg) {
  const bindingIndex = bindingRoot + slotOffset;
  return bindingUpdated(lView, bindingIndex, exp) ? updateBinding(lView, bindingIndex + 1, thisArg ? pureFn.call(thisArg, exp) : pureFn(exp)) : getPureFunctionReturnValue(lView, bindingIndex + 1);
}
function pureFunction2Internal(lView, bindingRoot, slotOffset, pureFn, exp1, exp2, thisArg) {
  const bindingIndex = bindingRoot + slotOffset;
  return bindingUpdated2(lView, bindingIndex, exp1, exp2) ? updateBinding(lView, bindingIndex + 2, thisArg ? pureFn.call(thisArg, exp1, exp2) : pureFn(exp1, exp2)) : getPureFunctionReturnValue(lView, bindingIndex + 2);
}
function pureFunction3Internal(lView, bindingRoot, slotOffset, pureFn, exp1, exp2, exp3, thisArg) {
  const bindingIndex = bindingRoot + slotOffset;
  return bindingUpdated3(lView, bindingIndex, exp1, exp2, exp3) ? updateBinding(lView, bindingIndex + 3, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3) : pureFn(exp1, exp2, exp3)) : getPureFunctionReturnValue(lView, bindingIndex + 3);
}
function pureFunction4Internal(lView, bindingRoot, slotOffset, pureFn, exp1, exp2, exp3, exp4, thisArg) {
  const bindingIndex = bindingRoot + slotOffset;
  return bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4) ? updateBinding(lView, bindingIndex + 4, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4) : pureFn(exp1, exp2, exp3, exp4)) : getPureFunctionReturnValue(lView, bindingIndex + 4);
}
function pureFunctionVInternal(lView, bindingRoot, slotOffset, pureFn, exps, thisArg) {
  let bindingIndex = bindingRoot + slotOffset;
  let different = false;
  for (let i = 0; i < exps.length; i++) {
    bindingUpdated(lView, bindingIndex++, exps[i]) && (different = true);
  }
  return different ? updateBinding(lView, bindingIndex, pureFn.apply(thisArg, exps)) : getPureFunctionReturnValue(lView, bindingIndex);
}
function ɵɵpipe(index, pipeName) {
  const tView = getTView();
  let pipeDef;
  const adjustedIndex = index + HEADER_OFFSET;
  if (tView.firstCreatePass) {
    pipeDef = getPipeDef2(pipeName, tView.pipeRegistry);
    tView.data[adjustedIndex] = pipeDef;
    if (pipeDef.onDestroy) {
      (tView.destroyHooks ??= []).push(adjustedIndex, pipeDef.onDestroy);
    }
  } else {
    pipeDef = tView.data[adjustedIndex];
  }
  const pipeFactory = pipeDef.factory || (pipeDef.factory = getFactoryDef(pipeDef.type, true));
  let previousInjectorProfilerContext;
  if (ngDevMode) {
    previousInjectorProfilerContext = setInjectorProfilerContext({
      injector: new NodeInjector(getCurrentTNode(), getLView()),
      token: pipeDef.type
    });
  }
  const previousInjectImplementation = setInjectImplementation(ɵɵdirectiveInject);
  try {
    const previousIncludeViewProviders = setIncludeViewProviders(false);
    const pipeInstance = pipeFactory();
    setIncludeViewProviders(previousIncludeViewProviders);
    store(tView, getLView(), adjustedIndex, pipeInstance);
    return pipeInstance;
  } finally {
    setInjectImplementation(previousInjectImplementation);
    ngDevMode && setInjectorProfilerContext(previousInjectorProfilerContext);
  }
}
function getPipeDef2(name, registry) {
  if (registry) {
    if (ngDevMode) {
      const pipes = registry.filter((pipe) => pipe.name === name);
      if (pipes.length > 1) {
        console.warn(formatRuntimeError(313, getMultipleMatchingPipesMessage(name)));
      }
    }
    for (let i = registry.length - 1; i >= 0; i--) {
      const pipeDef = registry[i];
      if (name === pipeDef.name) {
        return pipeDef;
      }
    }
  }
  if (ngDevMode) {
    throw new RuntimeError(-302, getPipeNotFoundErrorMessage(name));
  }
  return;
}
function getMultipleMatchingPipesMessage(name) {
  const lView = getLView();
  const declarationLView = lView[DECLARATION_COMPONENT_VIEW];
  const context = declarationLView[CONTEXT];
  const hostIsStandalone = isHostComponentStandalone(lView);
  const componentInfoMessage = context ? ` in the '${context.constructor.name}' component` : "";
  const verifyMessage = `check ${hostIsStandalone ? "'@Component.imports' of this component" : "the imports of this module"}`;
  const errorMessage = `Multiple pipes match the name \`${name}\`${componentInfoMessage}. ${verifyMessage}`;
  return errorMessage;
}
function getPipeNotFoundErrorMessage(name) {
  const lView = getLView();
  const declarationLView = lView[DECLARATION_COMPONENT_VIEW];
  const context = declarationLView[CONTEXT];
  const hostIsStandalone = isHostComponentStandalone(lView);
  const componentInfoMessage = context ? ` in the '${context.constructor.name}' component` : "";
  const verifyMessage = `Verify that it is ${hostIsStandalone ? "included in the '@Component.imports' of this component" : "declared or imported in this module"}`;
  const errorMessage = `The pipe '${name}' could not be found${componentInfoMessage}. ${verifyMessage}`;
  return errorMessage;
}
function ɵɵpipeBind1(index, offset, v1) {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load(lView, adjustedIndex);
  return isPure(lView, adjustedIndex) ? pureFunction1Internal(lView, getBindingRoot(), offset, pipeInstance.transform, v1, pipeInstance) : pipeInstance.transform(v1);
}
function ɵɵpipeBind2(index, slotOffset, v1, v2) {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load(lView, adjustedIndex);
  return isPure(lView, adjustedIndex) ? pureFunction2Internal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, v2, pipeInstance) : pipeInstance.transform(v1, v2);
}
function ɵɵpipeBind3(index, slotOffset, v1, v2, v3) {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load(lView, adjustedIndex);
  return isPure(lView, adjustedIndex) ? pureFunction3Internal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, v2, v3, pipeInstance) : pipeInstance.transform(v1, v2, v3);
}
function ɵɵpipeBind4(index, slotOffset, v1, v2, v3, v4) {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load(lView, adjustedIndex);
  return isPure(lView, adjustedIndex) ? pureFunction4Internal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, v2, v3, v4, pipeInstance) : pipeInstance.transform(v1, v2, v3, v4);
}
function ɵɵpipeBindV(index, slotOffset, values) {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load(lView, adjustedIndex);
  return isPure(lView, adjustedIndex) ? pureFunctionVInternal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, values, pipeInstance) : pipeInstance.transform.apply(pipeInstance, values);
}
function isPure(lView, index) {
  return lView[TVIEW].data[index].pure;
}
function ɵɵtemplateRefExtractor(tNode, lView) {
  return createTemplateRef(tNode, lView);
}
function ɵɵgetComponentDepsFactory(type, rawImports) {
  return () => {
    try {
      return depsTracker.getComponentDependencies(type, rawImports).dependencies;
    } catch (e) {
      console.error(`Computing dependencies in local compilation mode for the component "${type.name}" failed with the exception:`, e);
      throw e;
    }
  };
}
function ɵsetClassDebugInfo(type, debugInfo) {
  const def = getComponentDef(type);
  if (def !== null) {
    def.debugInfo = debugInfo;
  }
}
function ɵɵgetReplaceMetadataURL(id, timestamp, base) {
  const url = `./@ng/component?c=${id}&t=${encodeURIComponent(timestamp)}`;
  return new URL(url, base).href;
}
function ɵɵreplaceMetadata(type, applyMetadata, namespaces, locals, importMeta = null, id = null) {
  ngDevMode && assertComponentDef(type);
  const currentDef = getComponentDef(type);
  applyMetadata.apply(null, [type, namespaces, ...locals]);
  const {
    newDef,
    oldDef
  } = mergeWithExistingDefinition(currentDef, getComponentDef(type));
  type[NG_COMP_DEF] = newDef;
  if (oldDef.tView) {
    const trackedViews = getTrackedLViews().values();
    for (const root of trackedViews) {
      if (isRootView(root) && root[PARENT] === null) {
        recreateMatchingLViews(importMeta, id, newDef, oldDef, root);
      }
    }
  }
}
function mergeWithExistingDefinition(currentDef, newDef) {
  const clone = __spreadValues({}, currentDef);
  const replacement = Object.assign(currentDef, newDef, {
    directiveDefs: clone.directiveDefs,
    pipeDefs: clone.pipeDefs,
    setInput: clone.setInput,
    type: clone.type
  });
  ngDevMode && assertEqual(replacement, currentDef, "Expected definition to be merged in place");
  return {
    newDef: replacement,
    oldDef: clone
  };
}
function recreateMatchingLViews(importMeta, id, newDef, oldDef, rootLView) {
  ngDevMode && assertDefined(oldDef.tView, "Expected a component definition that has been instantiated at least once");
  const tView = rootLView[TVIEW];
  if (tView === oldDef.tView) {
    ngDevMode && assertComponentDef(oldDef.type);
    recreateLView(importMeta, id, newDef, oldDef, rootLView);
    return;
  }
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    const current = rootLView[i];
    if (isLContainer(current)) {
      if (isLView(current[HOST])) {
        recreateMatchingLViews(importMeta, id, newDef, oldDef, current[HOST]);
      }
      for (let j = CONTAINER_HEADER_OFFSET; j < current.length; j++) {
        recreateMatchingLViews(importMeta, id, newDef, oldDef, current[j]);
      }
    } else if (isLView(current)) {
      recreateMatchingLViews(importMeta, id, newDef, oldDef, current);
    }
  }
}
function clearRendererCache(factory, def) {
  factory.componentReplaced?.(def.id);
}
function recreateLView(importMeta, id, newDef, oldDef, lView) {
  const instance = lView[CONTEXT];
  let host = lView[HOST];
  const parentLView = lView[PARENT];
  ngDevMode && assertLView(parentLView);
  const tNode = lView[T_HOST];
  ngDevMode && assertTNodeType(tNode, 2);
  ngDevMode && assertNotEqual(newDef, oldDef, "Expected different component definition");
  const zone = lView[INJECTOR].get(NgZone, null);
  const recreate = () => {
    if (oldDef.encapsulation === ViewEncapsulation.ShadowDom || oldDef.encapsulation === ViewEncapsulation.ExperimentalIsolatedShadowDom) {
      const newHost = host.cloneNode(false);
      host.replaceWith(newHost);
      host = newHost;
    }
    const newTView = getOrCreateComponentTView(newDef);
    const newLView = createLView(parentLView, newTView, instance, getInitialLViewFlagsFromDef(newDef), host, tNode, null, null, null, null, null);
    replaceLViewInTree(parentLView, lView, newLView, tNode.index);
    destroyLView(lView[TVIEW], lView);
    const rendererFactory = lView[ENVIRONMENT].rendererFactory;
    clearRendererCache(rendererFactory, oldDef);
    newLView[RENDERER] = rendererFactory.createRenderer(host, newDef);
    removeViewFromDOM(lView[TVIEW], lView);
    resetProjectionState(tNode);
    renderView(newTView, newLView, instance);
    refreshView(newTView, newLView, newTView.template, instance);
  };
  if (zone === null) {
    executeWithInvalidateFallback(importMeta, id, recreate);
  } else {
    zone.run(() => executeWithInvalidateFallback(importMeta, id, recreate));
  }
}
function executeWithInvalidateFallback(importMeta, id, callback) {
  try {
    callback();
  } catch (e) {
    const error = e;
    if (id !== null && error.message) {
      const toLog = error.message + (error.stack ? "\n" + error.stack : "");
      importMeta?.hot?.send?.("angular:invalidate", {
        id,
        message: toLog,
        error: true
      });
    }
    throw e;
  }
}
function replaceLViewInTree(parentLView, oldLView, newLView, index) {
  for (let i = HEADER_OFFSET; i < parentLView[TVIEW].bindingStartIndex; i++) {
    const current = parentLView[i];
    if ((isLView(current) || isLContainer(current)) && current[NEXT] === oldLView) {
      current[NEXT] = newLView;
      break;
    }
  }
  if (parentLView[CHILD_HEAD] === oldLView) {
    parentLView[CHILD_HEAD] = newLView;
  }
  if (parentLView[CHILD_TAIL] === oldLView) {
    parentLView[CHILD_TAIL] = newLView;
  }
  newLView[NEXT] = oldLView[NEXT];
  oldLView[NEXT] = null;
  parentLView[index] = newLView;
}
function resetProjectionState(tNode) {
  if (tNode.projection !== null) {
    for (const current of tNode.projection) {
      if (isTNodeShape(current)) {
        current.projectionNext = null;
        current.flags &= ~2;
      }
    }
    tNode.projection = null;
  }
}
var angularCoreEnv = /* @__PURE__ */ (() => ({
  "ɵɵanimateEnter": ɵɵanimateEnter,
  "ɵɵanimateEnterListener": ɵɵanimateEnterListener,
  "ɵɵanimateLeave": ɵɵanimateLeave,
  "ɵɵanimateLeaveListener": ɵɵanimateLeaveListener,
  "ɵɵattribute": ɵɵattribute,
  "ɵɵdefineComponent": ɵɵdefineComponent,
  "ɵɵdefineDirective": ɵɵdefineDirective,
  "ɵɵdefineInjectable": ɵɵdefineInjectable,
  "ɵɵdefineInjector": ɵɵdefineInjector,
  "ɵɵdefineNgModule": ɵɵdefineNgModule,
  "ɵɵdefinePipe": ɵɵdefinePipe,
  "ɵɵdirectiveInject": ɵɵdirectiveInject,
  "ɵɵgetInheritedFactory": ɵɵgetInheritedFactory,
  "ɵɵinject": ɵɵinject,
  "ɵɵinjectAttribute": ɵɵinjectAttribute,
  "ɵɵinvalidFactory": ɵɵinvalidFactory,
  "ɵɵinvalidFactoryDep": ɵɵinvalidFactoryDep,
  "ɵɵtemplateRefExtractor": ɵɵtemplateRefExtractor,
  "ɵɵresetView": ɵɵresetView,
  "ɵɵHostDirectivesFeature": ɵɵHostDirectivesFeature,
  "ɵɵNgOnChangesFeature": ɵɵNgOnChangesFeature,
  "ɵɵProvidersFeature": ɵɵProvidersFeature,
  "ɵɵInheritDefinitionFeature": ɵɵInheritDefinitionFeature,
  "ɵɵExternalStylesFeature": ɵɵExternalStylesFeature,
  "ɵɵnextContext": ɵɵnextContext,
  "ɵɵnamespaceHTML": ɵɵnamespaceHTML,
  "ɵɵnamespaceMathML": ɵɵnamespaceMathML,
  "ɵɵnamespaceSVG": ɵɵnamespaceSVG,
  "ɵɵenableBindings": ɵɵenableBindings,
  "ɵɵdisableBindings": ɵɵdisableBindings,
  "ɵɵelementStart": ɵɵelementStart,
  "ɵɵelementEnd": ɵɵelementEnd,
  "ɵɵelement": ɵɵelement,
  "ɵɵelementContainerStart": ɵɵelementContainerStart,
  "ɵɵelementContainerEnd": ɵɵelementContainerEnd,
  "ɵɵdomElement": ɵɵdomElement,
  "ɵɵdomElementStart": ɵɵdomElementStart,
  "ɵɵdomElementEnd": ɵɵdomElementEnd,
  "ɵɵdomElementContainer": ɵɵdomElementContainer,
  "ɵɵdomElementContainerStart": ɵɵdomElementContainerStart,
  "ɵɵdomElementContainerEnd": ɵɵdomElementContainerEnd,
  "ɵɵdomTemplate": ɵɵdomTemplate,
  "ɵɵdomListener": ɵɵdomListener,
  "ɵɵelementContainer": ɵɵelementContainer,
  "ɵɵpureFunction0": ɵɵpureFunction0,
  "ɵɵpureFunction1": ɵɵpureFunction1,
  "ɵɵpureFunction2": ɵɵpureFunction2,
  "ɵɵpureFunction3": ɵɵpureFunction3,
  "ɵɵpureFunction4": ɵɵpureFunction4,
  "ɵɵpureFunction5": ɵɵpureFunction5,
  "ɵɵpureFunction6": ɵɵpureFunction6,
  "ɵɵpureFunction7": ɵɵpureFunction7,
  "ɵɵpureFunction8": ɵɵpureFunction8,
  "ɵɵpureFunctionV": ɵɵpureFunctionV,
  "ɵɵgetCurrentView": ɵɵgetCurrentView,
  "ɵɵrestoreView": ɵɵrestoreView,
  "ɵɵlistener": ɵɵlistener,
  "ɵɵprojection": ɵɵprojection,
  "ɵɵsyntheticHostProperty": ɵɵsyntheticHostProperty,
  "ɵɵsyntheticHostListener": ɵɵsyntheticHostListener,
  "ɵɵpipeBind1": ɵɵpipeBind1,
  "ɵɵpipeBind2": ɵɵpipeBind2,
  "ɵɵpipeBind3": ɵɵpipeBind3,
  "ɵɵpipeBind4": ɵɵpipeBind4,
  "ɵɵpipeBindV": ɵɵpipeBindV,
  "ɵɵprojectionDef": ɵɵprojectionDef,
  "ɵɵdomProperty": ɵɵdomProperty,
  "ɵɵariaProperty": ɵɵariaProperty,
  "ɵɵproperty": ɵɵproperty,
  "ɵɵcontrol": ɵɵcontrol,
  "ɵɵcontrolCreate": ɵɵcontrolCreate,
  "ɵɵpipe": ɵɵpipe,
  "ɵɵqueryRefresh": ɵɵqueryRefresh,
  "ɵɵqueryAdvance": ɵɵqueryAdvance,
  "ɵɵviewQuery": ɵɵviewQuery,
  "ɵɵviewQuerySignal": ɵɵviewQuerySignal,
  "ɵɵloadQuery": ɵɵloadQuery,
  "ɵɵcontentQuery": ɵɵcontentQuery,
  "ɵɵcontentQuerySignal": ɵɵcontentQuerySignal,
  "ɵɵreference": ɵɵreference,
  "ɵɵclassMap": ɵɵclassMap,
  "ɵɵstyleMap": ɵɵstyleMap,
  "ɵɵstyleProp": ɵɵstyleProp,
  "ɵɵclassProp": ɵɵclassProp,
  "ɵɵadvance": ɵɵadvance,
  "ɵɵtemplate": ɵɵtemplate,
  "ɵɵconditional": ɵɵconditional,
  "ɵɵconditionalCreate": ɵɵconditionalCreate,
  "ɵɵconditionalBranchCreate": ɵɵconditionalBranchCreate,
  "ɵɵdefer": ɵɵdefer,
  "ɵɵdeferWhen": ɵɵdeferWhen,
  "ɵɵdeferOnIdle": ɵɵdeferOnIdle,
  "ɵɵdeferOnImmediate": ɵɵdeferOnImmediate,
  "ɵɵdeferOnTimer": ɵɵdeferOnTimer,
  "ɵɵdeferOnHover": ɵɵdeferOnHover,
  "ɵɵdeferOnInteraction": ɵɵdeferOnInteraction,
  "ɵɵdeferOnViewport": ɵɵdeferOnViewport,
  "ɵɵdeferPrefetchWhen": ɵɵdeferPrefetchWhen,
  "ɵɵdeferPrefetchOnIdle": ɵɵdeferPrefetchOnIdle,
  "ɵɵdeferPrefetchOnImmediate": ɵɵdeferPrefetchOnImmediate,
  "ɵɵdeferPrefetchOnTimer": ɵɵdeferPrefetchOnTimer,
  "ɵɵdeferPrefetchOnHover": ɵɵdeferPrefetchOnHover,
  "ɵɵdeferPrefetchOnInteraction": ɵɵdeferPrefetchOnInteraction,
  "ɵɵdeferPrefetchOnViewport": ɵɵdeferPrefetchOnViewport,
  "ɵɵdeferHydrateWhen": ɵɵdeferHydrateWhen,
  "ɵɵdeferHydrateNever": ɵɵdeferHydrateNever,
  "ɵɵdeferHydrateOnIdle": ɵɵdeferHydrateOnIdle,
  "ɵɵdeferHydrateOnImmediate": ɵɵdeferHydrateOnImmediate,
  "ɵɵdeferHydrateOnTimer": ɵɵdeferHydrateOnTimer,
  "ɵɵdeferHydrateOnHover": ɵɵdeferHydrateOnHover,
  "ɵɵdeferHydrateOnInteraction": ɵɵdeferHydrateOnInteraction,
  "ɵɵdeferHydrateOnViewport": ɵɵdeferHydrateOnViewport,
  "ɵɵdeferEnableTimerScheduling": ɵɵdeferEnableTimerScheduling,
  "ɵɵrepeater": ɵɵrepeater,
  "ɵɵrepeaterCreate": ɵɵrepeaterCreate,
  "ɵɵrepeaterTrackByIndex": ɵɵrepeaterTrackByIndex,
  "ɵɵrepeaterTrackByIdentity": ɵɵrepeaterTrackByIdentity,
  "ɵɵcomponentInstance": ɵɵcomponentInstance,
  "ɵɵtext": ɵɵtext,
  "ɵɵtextInterpolate": ɵɵtextInterpolate,
  "ɵɵtextInterpolate1": ɵɵtextInterpolate1,
  "ɵɵtextInterpolate2": ɵɵtextInterpolate2,
  "ɵɵtextInterpolate3": ɵɵtextInterpolate3,
  "ɵɵtextInterpolate4": ɵɵtextInterpolate4,
  "ɵɵtextInterpolate5": ɵɵtextInterpolate5,
  "ɵɵtextInterpolate6": ɵɵtextInterpolate6,
  "ɵɵtextInterpolate7": ɵɵtextInterpolate7,
  "ɵɵtextInterpolate8": ɵɵtextInterpolate8,
  "ɵɵtextInterpolateV": ɵɵtextInterpolateV,
  "ɵɵi18n": ɵɵi18n,
  "ɵɵi18nAttributes": ɵɵi18nAttributes,
  "ɵɵi18nExp": ɵɵi18nExp,
  "ɵɵi18nStart": ɵɵi18nStart,
  "ɵɵi18nEnd": ɵɵi18nEnd,
  "ɵɵi18nApply": ɵɵi18nApply,
  "ɵɵi18nPostprocess": ɵɵi18nPostprocess,
  "ɵɵresolveWindow": ɵɵresolveWindow,
  "ɵɵresolveDocument": ɵɵresolveDocument,
  "ɵɵresolveBody": ɵɵresolveBody,
  "ɵɵsetComponentScope": ɵɵsetComponentScope,
  "ɵɵsetNgModuleScope": ɵɵsetNgModuleScope,
  "ɵɵregisterNgModuleType": registerNgModuleType,
  "ɵɵgetComponentDepsFactory": ɵɵgetComponentDepsFactory,
  "ɵsetClassDebugInfo": ɵsetClassDebugInfo,
  "ɵɵdeclareLet": ɵɵdeclareLet,
  "ɵɵstoreLet": ɵɵstoreLet,
  "ɵɵreadContextLet": ɵɵreadContextLet,
  "ɵɵattachSourceLocations": ɵɵattachSourceLocations,
  "ɵɵinterpolate": ɵɵinterpolate,
  "ɵɵinterpolate1": ɵɵinterpolate1,
  "ɵɵinterpolate2": ɵɵinterpolate2,
  "ɵɵinterpolate3": ɵɵinterpolate3,
  "ɵɵinterpolate4": ɵɵinterpolate4,
  "ɵɵinterpolate5": ɵɵinterpolate5,
  "ɵɵinterpolate6": ɵɵinterpolate6,
  "ɵɵinterpolate7": ɵɵinterpolate7,
  "ɵɵinterpolate8": ɵɵinterpolate8,
  "ɵɵinterpolateV": ɵɵinterpolateV,
  "ɵɵsanitizeHtml": ɵɵsanitizeHtml,
  "ɵɵsanitizeStyle": ɵɵsanitizeStyle,
  "ɵɵsanitizeResourceUrl": ɵɵsanitizeResourceUrl,
  "ɵɵsanitizeScript": ɵɵsanitizeScript,
  "ɵɵvalidateAttribute": ɵɵvalidateAttribute,
  "ɵɵsanitizeUrl": ɵɵsanitizeUrl,
  "ɵɵsanitizeUrlOrResourceUrl": ɵɵsanitizeUrlOrResourceUrl,
  "ɵɵtrustConstantHtml": ɵɵtrustConstantHtml,
  "ɵɵtrustConstantResourceUrl": ɵɵtrustConstantResourceUrl,
  "forwardRef": forwardRef,
  "resolveForwardRef": resolveForwardRef,
  "ɵɵtwoWayProperty": ɵɵtwoWayProperty,
  "ɵɵtwoWayBindingSet": ɵɵtwoWayBindingSet,
  "ɵɵtwoWayListener": ɵɵtwoWayListener,
  "ɵɵreplaceMetadata": ɵɵreplaceMetadata,
  "ɵɵgetReplaceMetadataURL": ɵɵgetReplaceMetadataURL
}))();
var jitOptions = null;
function setJitOptions(options) {
  if (jitOptions !== null) {
    if (options.defaultEncapsulation !== jitOptions.defaultEncapsulation) {
      ngDevMode && console.error("Provided value for `defaultEncapsulation` can not be changed once it has been set.");
      return;
    }
    if (options.preserveWhitespaces !== jitOptions.preserveWhitespaces) {
      ngDevMode && console.error("Provided value for `preserveWhitespaces` can not be changed once it has been set.");
      return;
    }
  }
  jitOptions = options;
}
function getJitOptions() {
  return jitOptions;
}
function resetJitOptions() {
  jitOptions = null;
}
var moduleQueue = [];
function enqueueModuleForDelayedScoping(moduleType, ngModule) {
  moduleQueue.push({
    moduleType,
    ngModule
  });
}
var flushingModuleQueue = false;
function flushModuleScopingQueueAsMuchAsPossible() {
  if (!flushingModuleQueue) {
    flushingModuleQueue = true;
    try {
      for (let i = moduleQueue.length - 1; i >= 0; i--) {
        const {
          moduleType,
          ngModule
        } = moduleQueue[i];
        if (ngModule.declarations && ngModule.declarations.every(isResolvedDeclaration)) {
          moduleQueue.splice(i, 1);
          setScopeOnDeclaredComponents(moduleType, ngModule);
        }
      }
    } finally {
      flushingModuleQueue = false;
    }
  }
}
function isResolvedDeclaration(declaration) {
  if (Array.isArray(declaration)) {
    return declaration.every(isResolvedDeclaration);
  }
  return !!resolveForwardRef(declaration);
}
function compileNgModule(moduleType, ngModule = {}) {
  compileNgModuleDefs(moduleType, ngModule);
  if (ngModule.id !== void 0) {
    registerNgModuleType(moduleType, ngModule.id);
  }
  enqueueModuleForDelayedScoping(moduleType, ngModule);
}
function compileNgModuleDefs(moduleType, ngModule, allowDuplicateDeclarationsInRoot = false) {
  ngDevMode && assertDefined(moduleType, "Required value moduleType");
  ngDevMode && assertDefined(ngModule, "Required value ngModule");
  const declarations = flatten(ngModule.declarations || EMPTY_ARRAY);
  let ngModuleDef = null;
  Object.defineProperty(moduleType, NG_MOD_DEF, {
    configurable: true,
    get: () => {
      if (ngModuleDef === null) {
        if (ngDevMode && ngModule.imports && ngModule.imports.indexOf(moduleType) > -1) {
          throw new Error(`'${stringifyForError(moduleType)}' module can't import itself`);
        }
        const compiler = getCompilerFacade({
          usage: 0,
          kind: "NgModule",
          type: moduleType
        });
        ngModuleDef = compiler.compileNgModule(angularCoreEnv, `ng:///${moduleType.name}/ɵmod.js`, {
          type: moduleType,
          bootstrap: flatten(ngModule.bootstrap || EMPTY_ARRAY).map(resolveForwardRef),
          declarations: declarations.map(resolveForwardRef),
          imports: flatten(ngModule.imports || EMPTY_ARRAY).map(resolveForwardRef).map(expandModuleWithProviders),
          exports: flatten(ngModule.exports || EMPTY_ARRAY).map(resolveForwardRef).map(expandModuleWithProviders),
          schemas: ngModule.schemas ? flatten(ngModule.schemas) : null,
          id: ngModule.id || null
        });
        if (!ngModuleDef.schemas) {
          ngModuleDef.schemas = [];
        }
      }
      return ngModuleDef;
    }
  });
  let ngFactoryDef = null;
  Object.defineProperty(moduleType, NG_FACTORY_DEF, {
    get: () => {
      if (ngFactoryDef === null) {
        const compiler = getCompilerFacade({
          usage: 0,
          kind: "NgModule",
          type: moduleType
        });
        ngFactoryDef = compiler.compileFactory(angularCoreEnv, `ng:///${moduleType.name}/ɵfac.js`, {
          name: moduleType.name,
          type: moduleType,
          deps: reflectDependencies(moduleType),
          target: compiler.FactoryTarget.NgModule,
          typeArgumentCount: 0
        });
      }
      return ngFactoryDef;
    },
    configurable: !!ngDevMode
  });
  let ngInjectorDef = null;
  Object.defineProperty(moduleType, NG_INJ_DEF, {
    get: () => {
      if (ngInjectorDef === null) {
        ngDevMode && verifySemanticsOfNgModuleDef(moduleType, allowDuplicateDeclarationsInRoot);
        const meta = {
          name: moduleType.name,
          type: moduleType,
          providers: ngModule.providers || EMPTY_ARRAY,
          imports: [(ngModule.imports || EMPTY_ARRAY).map(resolveForwardRef), (ngModule.exports || EMPTY_ARRAY).map(resolveForwardRef)]
        };
        const compiler = getCompilerFacade({
          usage: 0,
          kind: "NgModule",
          type: moduleType
        });
        ngInjectorDef = compiler.compileInjector(angularCoreEnv, `ng:///${moduleType.name}/ɵinj.js`, meta);
      }
      return ngInjectorDef;
    },
    configurable: !!ngDevMode
  });
}
function generateStandaloneInDeclarationsError(type, location) {
  const prefix = `Unexpected "${stringifyForError(type)}" found in the "declarations" array of the`;
  const suffix = `"${stringifyForError(type)}" is marked as standalone and can't be declared in any NgModule - did you intend to import it instead (by adding it to the "imports" array)?`;
  return `${prefix} ${location}, ${suffix}`;
}
function verifySemanticsOfNgModuleDef(moduleType, allowDuplicateDeclarationsInRoot, importingModule) {
  if (verifiedNgModule.get(moduleType)) return;
  if (isStandalone(moduleType)) return;
  verifiedNgModule.set(moduleType, true);
  moduleType = resolveForwardRef(moduleType);
  let ngModuleDef;
  if (importingModule) {
    ngModuleDef = getNgModuleDef(moduleType);
    if (!ngModuleDef) {
      throw new Error(`Unexpected value '${moduleType.name}' imported by the module '${importingModule.name}'. Please add an @NgModule annotation.`);
    }
  } else {
    ngModuleDef = getNgModuleDefOrThrow(moduleType);
  }
  const errors = [];
  const declarations = maybeUnwrapFn(ngModuleDef.declarations);
  const imports = maybeUnwrapFn(ngModuleDef.imports);
  flatten(imports).map(unwrapModuleWithProvidersImports).forEach((modOrStandaloneCmpt) => {
    verifySemanticsOfNgModuleImport(modOrStandaloneCmpt, moduleType);
    verifySemanticsOfNgModuleDef(modOrStandaloneCmpt, false, moduleType);
  });
  const exports = maybeUnwrapFn(ngModuleDef.exports);
  declarations.forEach(verifyDeclarationsHaveDefinitions);
  declarations.forEach(verifyDirectivesHaveSelector);
  declarations.forEach((declarationType) => verifyNotStandalone(declarationType, moduleType));
  const combinedDeclarations = [...declarations.map(resolveForwardRef), ...flatten(imports.map(computeCombinedExports)).map(resolveForwardRef)];
  exports.forEach(verifyExportsAreDeclaredOrReExported);
  declarations.forEach((decl) => verifyDeclarationIsUnique(decl, allowDuplicateDeclarationsInRoot));
  const ngModule = getAnnotation(moduleType, "NgModule");
  if (ngModule) {
    ngModule.imports && flatten(ngModule.imports).map(unwrapModuleWithProvidersImports).forEach((mod) => {
      verifySemanticsOfNgModuleImport(mod, moduleType);
      verifySemanticsOfNgModuleDef(mod, false, moduleType);
    });
    ngModule.bootstrap && deepForEach(ngModule.bootstrap, verifyCorrectBootstrapType);
    ngModule.bootstrap && deepForEach(ngModule.bootstrap, verifyComponentIsPartOfNgModule);
  }
  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
  function verifyDeclarationsHaveDefinitions(type) {
    type = resolveForwardRef(type);
    const def = getComponentDef(type) || getDirectiveDef(type) || getPipeDef(type);
    if (!def) {
      errors.push(`Unexpected value '${stringifyForError(type)}' declared by the module '${stringifyForError(moduleType)}'. Please add a @Pipe/@Directive/@Component annotation.`);
    }
  }
  function verifyDirectivesHaveSelector(type) {
    type = resolveForwardRef(type);
    const def = getDirectiveDef(type);
    if (!getComponentDef(type) && def && def.selectors.length == 0) {
      errors.push(`Directive ${stringifyForError(type)} has no selector, please add it!`);
    }
  }
  function verifyNotStandalone(type, moduleType2) {
    type = resolveForwardRef(type);
    const def = getComponentDef(type) || getDirectiveDef(type) || getPipeDef(type);
    if (def?.standalone) {
      const location = `"${stringifyForError(moduleType2)}" NgModule`;
      errors.push(generateStandaloneInDeclarationsError(type, location));
    }
  }
  function verifyExportsAreDeclaredOrReExported(type) {
    type = resolveForwardRef(type);
    const kind = getComponentDef(type) && "component" || getDirectiveDef(type) && "directive" || getPipeDef(type) && "pipe";
    if (kind) {
      if (combinedDeclarations.lastIndexOf(type) === -1) {
        errors.push(`Can't export ${kind} ${stringifyForError(type)} from ${stringifyForError(moduleType)} as it was neither declared nor imported!`);
      }
    }
  }
  function verifyDeclarationIsUnique(type, suppressErrors) {
    type = resolveForwardRef(type);
    const existingModule = ownerNgModule.get(type);
    if (existingModule && existingModule !== moduleType) {
      if (!suppressErrors) {
        const modules2 = [existingModule, moduleType].map(stringifyForError).sort();
        errors.push(`Type ${stringifyForError(type)} is part of the declarations of 2 modules: ${modules2[0]} and ${modules2[1]}! Please consider moving ${stringifyForError(type)} to a higher module that imports ${modules2[0]} and ${modules2[1]}. You can also create a new NgModule that exports and includes ${stringifyForError(type)} then import that NgModule in ${modules2[0]} and ${modules2[1]}.`);
      }
    } else {
      ownerNgModule.set(type, moduleType);
    }
  }
  function verifyComponentIsPartOfNgModule(type) {
    type = resolveForwardRef(type);
    const existingModule = ownerNgModule.get(type);
    if (!existingModule && !isStandalone(type)) {
      errors.push(`Component ${stringifyForError(type)} is not part of any NgModule or the module has not been imported into your module.`);
    }
  }
  function verifyCorrectBootstrapType(type) {
    type = resolveForwardRef(type);
    if (!getComponentDef(type)) {
      errors.push(`${stringifyForError(type)} cannot be used as an entry component.`);
    }
    if (isStandalone(type)) {
      errors.push(`The \`${stringifyForError(type)}\` class is a standalone component, which can not be used in the \`@NgModule.bootstrap\` array. Use the \`bootstrapApplication\` function for bootstrap instead.`);
    }
  }
  function verifySemanticsOfNgModuleImport(type, importingModule2) {
    type = resolveForwardRef(type);
    const directiveDef = getComponentDef(type) || getDirectiveDef(type);
    if (directiveDef !== null && !directiveDef.standalone) {
      throw new Error(`Unexpected directive '${type.name}' imported by the module '${importingModule2.name}'. Please add an @NgModule annotation.`);
    }
    const pipeDef = getPipeDef(type);
    if (pipeDef !== null && !pipeDef.standalone) {
      throw new Error(`Unexpected pipe '${type.name}' imported by the module '${importingModule2.name}'. Please add an @NgModule annotation.`);
    }
  }
}
function unwrapModuleWithProvidersImports(typeOrWithProviders) {
  typeOrWithProviders = resolveForwardRef(typeOrWithProviders);
  return typeOrWithProviders.ngModule || typeOrWithProviders;
}
function getAnnotation(type, name) {
  let annotation = null;
  collect(type.__annotations__);
  collect(type.decorators);
  return annotation;
  function collect(annotations) {
    if (annotations) {
      annotations.forEach(readAnnotation);
    }
  }
  function readAnnotation(decorator) {
    if (!annotation) {
      const proto = Object.getPrototypeOf(decorator);
      if (proto.ngMetadataName == name) {
        annotation = decorator;
      } else if (decorator.type) {
        const proto2 = Object.getPrototypeOf(decorator.type);
        if (proto2.ngMetadataName == name) {
          annotation = decorator.args[0];
        }
      }
    }
  }
}
var ownerNgModule = /* @__PURE__ */ new WeakMap();
var verifiedNgModule = /* @__PURE__ */ new WeakMap();
function resetCompiledComponents() {
  ownerNgModule = /* @__PURE__ */ new WeakMap();
  verifiedNgModule = /* @__PURE__ */ new WeakMap();
  moduleQueue.length = 0;
  GENERATED_COMP_IDS.clear();
}
function computeCombinedExports(type) {
  type = resolveForwardRef(type);
  const ngModuleDef = getNgModuleDef(type);
  if (ngModuleDef === null) {
    return [type];
  }
  return flatten(maybeUnwrapFn(ngModuleDef.exports).map((type2) => {
    const ngModuleDef2 = getNgModuleDef(type2);
    if (ngModuleDef2) {
      verifySemanticsOfNgModuleDef(type2, false);
      return computeCombinedExports(type2);
    } else {
      return type2;
    }
  }));
}
function setScopeOnDeclaredComponents(moduleType, ngModule) {
  const declarations = flatten(ngModule.declarations || EMPTY_ARRAY);
  const transitiveScopes = transitiveScopesFor(moduleType);
  declarations.forEach((declaration) => {
    declaration = resolveForwardRef(declaration);
    if (declaration.hasOwnProperty(NG_COMP_DEF)) {
      const component = declaration;
      const componentDef = getComponentDef(component);
      patchComponentDefWithScope(componentDef, transitiveScopes);
    } else if (!declaration.hasOwnProperty(NG_DIR_DEF) && !declaration.hasOwnProperty(NG_PIPE_DEF)) {
      declaration.ngSelectorScope = moduleType;
    }
  });
}
function patchComponentDefWithScope(componentDef, transitiveScopes) {
  componentDef.directiveDefs = () => Array.from(transitiveScopes.compilation.directives).map((dir) => dir.hasOwnProperty(NG_COMP_DEF) ? getComponentDef(dir) : getDirectiveDef(dir)).filter((def) => !!def);
  componentDef.pipeDefs = () => Array.from(transitiveScopes.compilation.pipes).map((pipe) => getPipeDef(pipe));
  componentDef.schemas = transitiveScopes.schemas;
  componentDef.tView = null;
}
function transitiveScopesFor(type) {
  if (isNgModule(type)) {
    const scope = depsTracker.getNgModuleScope(type);
    const def = getNgModuleDefOrThrow(type);
    return __spreadValues({
      schemas: def.schemas || null
    }, scope);
  } else if (isStandalone(type)) {
    const directiveDef = getComponentDef(type) || getDirectiveDef(type);
    if (directiveDef !== null) {
      return {
        schemas: null,
        compilation: {
          directives: /* @__PURE__ */ new Set(),
          pipes: /* @__PURE__ */ new Set()
        },
        exported: {
          directives: /* @__PURE__ */ new Set([type]),
          pipes: /* @__PURE__ */ new Set()
        }
      };
    }
    const pipeDef = getPipeDef(type);
    if (pipeDef !== null) {
      return {
        schemas: null,
        compilation: {
          directives: /* @__PURE__ */ new Set(),
          pipes: /* @__PURE__ */ new Set()
        },
        exported: {
          directives: /* @__PURE__ */ new Set(),
          pipes: /* @__PURE__ */ new Set([type])
        }
      };
    }
  }
  throw new Error(`${type.name} does not have a module def (ɵmod property)`);
}
function expandModuleWithProviders(value) {
  if (isModuleWithProviders(value)) {
    return value.ngModule;
  }
  return value;
}
var compilationDepth = 0;
function compileComponent(type, metadata) {
  (typeof ngDevMode === "undefined" || ngDevMode) && initNgDevMode();
  let ngComponentDef = null;
  maybeQueueResolutionOfComponentResources(type, metadata);
  addDirectiveFactoryDef(type, metadata);
  Object.defineProperty(type, NG_COMP_DEF, {
    get: () => {
      if (ngComponentDef === null) {
        const compiler = getCompilerFacade({
          usage: 0,
          kind: "component",
          type
        });
        if (componentNeedsResolution(metadata)) {
          const error = [`Component '${type.name}' is not resolved:`];
          if (metadata.templateUrl) {
            error.push(` - templateUrl: ${metadata.templateUrl}`);
          }
          if (metadata.styleUrls && metadata.styleUrls.length) {
            error.push(` - styleUrls: ${JSON.stringify(metadata.styleUrls)}`);
          }
          if (metadata.styleUrl) {
            error.push(` - styleUrl: ${metadata.styleUrl}`);
          }
          error.push(`Did you run and wait for 'resolveComponentResources()'?`);
          throw new Error(error.join("\n"));
        }
        const options = getJitOptions();
        let preserveWhitespaces = metadata.preserveWhitespaces;
        if (preserveWhitespaces === void 0) {
          if (options !== null && options.preserveWhitespaces !== void 0) {
            preserveWhitespaces = options.preserveWhitespaces;
          } else {
            preserveWhitespaces = false;
          }
        }
        let encapsulation = metadata.encapsulation;
        if (encapsulation === void 0) {
          if (options !== null && options.defaultEncapsulation !== void 0) {
            encapsulation = options.defaultEncapsulation;
          } else {
            encapsulation = ViewEncapsulation.Emulated;
          }
        }
        const templateUrl = metadata.templateUrl || `ng:///${type.name}/template.html`;
        const baseMeta = directiveMetadata(type, metadata);
        const meta = __spreadProps(__spreadValues({}, baseMeta), {
          typeSourceSpan: compiler.createParseSourceSpan("Component", type.name, templateUrl),
          template: metadata.template || "",
          preserveWhitespaces,
          styles: typeof metadata.styles === "string" ? [metadata.styles] : metadata.styles || EMPTY_ARRAY,
          animations: metadata.animations,
          declarations: [],
          changeDetection: metadata.changeDetection,
          encapsulation,
          viewProviders: metadata.viewProviders || null,
          hasDirectiveDependencies: !baseMeta.isStandalone || metadata.imports != null && metadata.imports.length > 0
        });
        compilationDepth++;
        try {
          if (meta.usesInheritance) {
            addDirectiveDefToUndecoratedParents(type);
          }
          ngComponentDef = compiler.compileComponent(angularCoreEnv, templateUrl, meta);
          if (meta.isStandalone) {
            const imports = flatten(metadata.imports || EMPTY_ARRAY);
            const {
              directiveDefs,
              pipeDefs
            } = getStandaloneDefFunctions(type, imports);
            ngComponentDef.directiveDefs = directiveDefs;
            ngComponentDef.pipeDefs = pipeDefs;
            ngComponentDef.dependencies = () => imports.map(resolveForwardRef);
          }
        } finally {
          compilationDepth--;
        }
        if (compilationDepth === 0) {
          flushModuleScopingQueueAsMuchAsPossible();
        }
        if (hasSelectorScope(type)) {
          const scopes = transitiveScopesFor(type.ngSelectorScope);
          patchComponentDefWithScope(ngComponentDef, scopes);
        }
        if (metadata.schemas) {
          if (meta.isStandalone) {
            ngComponentDef.schemas = metadata.schemas;
          } else {
            throw new Error(`The 'schemas' was specified for the ${stringifyForError(type)} but is only valid on a component that is standalone.`);
          }
        } else if (meta.isStandalone) {
          ngComponentDef.schemas = [];
        }
      }
      return ngComponentDef;
    },
    set: (def) => {
      ngComponentDef = def;
    },
    configurable: !!ngDevMode
  });
}
function getStandaloneDefFunctions(type, imports) {
  const directiveDefs = () => {
    if (ngDevMode) {
      for (const rawDep of imports) {
        verifyStandaloneImport(rawDep, type);
      }
    }
    if (!isComponent(type)) {
      return [];
    }
    const scope = depsTracker.getStandaloneComponentScope(type, imports);
    return [...scope.compilation.directives].map((p) => getComponentDef(p) || getDirectiveDef(p)).filter((d) => d !== null);
  };
  const pipeDefs = () => {
    if (ngDevMode) {
      for (const rawDep of imports) {
        verifyStandaloneImport(rawDep, type);
      }
    }
    if (!isComponent(type)) {
      return [];
    }
    const scope = depsTracker.getStandaloneComponentScope(type, imports);
    return [...scope.compilation.pipes].map((p) => getPipeDef(p)).filter((d) => d !== null);
  };
  return {
    directiveDefs,
    pipeDefs
  };
}
function hasSelectorScope(component) {
  return component.ngSelectorScope !== void 0;
}
function compileDirective(type, directive) {
  let ngDirectiveDef = null;
  addDirectiveFactoryDef(type, directive || {});
  Object.defineProperty(type, NG_DIR_DEF, {
    get: () => {
      if (ngDirectiveDef === null) {
        const meta = getDirectiveMetadata(type, directive || {});
        const compiler = getCompilerFacade({
          usage: 0,
          kind: "directive",
          type
        });
        ngDirectiveDef = compiler.compileDirective(angularCoreEnv, meta.sourceMapUrl, meta.metadata);
      }
      return ngDirectiveDef;
    },
    configurable: !!ngDevMode
  });
}
function getDirectiveMetadata(type, metadata) {
  const name = type && type.name;
  const sourceMapUrl = `ng:///${name}/ɵdir.js`;
  const compiler = getCompilerFacade({
    usage: 0,
    kind: "directive",
    type
  });
  const facade = directiveMetadata(type, metadata);
  facade.typeSourceSpan = compiler.createParseSourceSpan("Directive", name, sourceMapUrl);
  if (facade.usesInheritance) {
    addDirectiveDefToUndecoratedParents(type);
  }
  return {
    metadata: facade,
    sourceMapUrl
  };
}
function addDirectiveFactoryDef(type, metadata) {
  let ngFactoryDef = null;
  Object.defineProperty(type, NG_FACTORY_DEF, {
    get: () => {
      if (ngFactoryDef === null) {
        const meta = getDirectiveMetadata(type, metadata);
        const compiler = getCompilerFacade({
          usage: 0,
          kind: "directive",
          type
        });
        ngFactoryDef = compiler.compileFactory(angularCoreEnv, `ng:///${type.name}/ɵfac.js`, {
          name: meta.metadata.name,
          type: meta.metadata.type,
          typeArgumentCount: 0,
          deps: reflectDependencies(type),
          target: compiler.FactoryTarget.Directive
        });
      }
      return ngFactoryDef;
    },
    configurable: !!ngDevMode
  });
}
function extendsDirectlyFromObject(type) {
  return Object.getPrototypeOf(type.prototype) === Object.prototype;
}
function directiveMetadata(type, metadata) {
  const reflect = getReflect();
  const propMetadata = reflect.ownPropMetadata(type);
  return {
    name: type.name,
    type,
    selector: metadata.selector !== void 0 ? metadata.selector : null,
    host: metadata.host || EMPTY_OBJ,
    propMetadata,
    inputs: metadata.inputs || EMPTY_ARRAY,
    outputs: metadata.outputs || EMPTY_ARRAY,
    queries: extractQueriesMetadata(type, propMetadata, isContentQuery),
    lifecycle: {
      usesOnChanges: reflect.hasLifecycleHook(type, "ngOnChanges")
    },
    typeSourceSpan: null,
    usesInheritance: !extendsDirectlyFromObject(type),
    exportAs: extractExportAs(metadata.exportAs),
    providers: metadata.providers || null,
    viewQueries: extractQueriesMetadata(type, propMetadata, isViewQuery),
    isStandalone: metadata.standalone === void 0 ? true : !!metadata.standalone,
    isSignal: !!metadata.signals,
    hostDirectives: metadata.hostDirectives?.map((directive) => typeof directive === "function" ? {
      directive
    } : directive) || null
  };
}
function addDirectiveDefToUndecoratedParents(type) {
  const objPrototype = Object.prototype;
  let parent = Object.getPrototypeOf(type.prototype).constructor;
  while (parent && parent !== objPrototype) {
    if (!getDirectiveDef(parent) && !getComponentDef(parent) && shouldAddAbstractDirective(parent)) {
      compileDirective(parent, null);
    }
    parent = Object.getPrototypeOf(parent);
  }
}
function convertToR3QueryPredicate(selector) {
  return typeof selector === "string" ? splitByComma(selector) : resolveForwardRef(selector);
}
function convertToR3QueryMetadata(propertyName, ann) {
  return {
    propertyName,
    predicate: convertToR3QueryPredicate(ann.selector),
    descendants: ann.descendants,
    first: ann.first,
    read: ann.read ? ann.read : null,
    static: !!ann.static,
    emitDistinctChangesOnly: !!ann.emitDistinctChangesOnly,
    isSignal: !!ann.isSignal
  };
}
function extractQueriesMetadata(type, propMetadata, isQueryAnn) {
  const queriesMeta = [];
  for (const field in propMetadata) {
    if (propMetadata.hasOwnProperty(field)) {
      const annotations = propMetadata[field];
      annotations.forEach((ann) => {
        if (isQueryAnn(ann)) {
          if (!ann.selector) {
            throw new Error(`Can't construct a query for the property "${field}" of "${stringifyForError(type)}" since the query selector wasn't defined.`);
          }
          if (annotations.some(isInputAnnotation)) {
            throw new Error(`Cannot combine @Input decorators with query decorators`);
          }
          queriesMeta.push(convertToR3QueryMetadata(field, ann));
        }
      });
    }
  }
  return queriesMeta;
}
function extractExportAs(exportAs) {
  return exportAs === void 0 ? null : splitByComma(exportAs);
}
function isContentQuery(value) {
  const name = value.ngMetadataName;
  return name === "ContentChild" || name === "ContentChildren";
}
function isViewQuery(value) {
  const name = value.ngMetadataName;
  return name === "ViewChild" || name === "ViewChildren";
}
function isInputAnnotation(value) {
  return value.ngMetadataName === "Input";
}
function splitByComma(value) {
  return value.split(",").map((piece) => piece.trim());
}
var LIFECYCLE_HOOKS = ["ngOnChanges", "ngOnInit", "ngOnDestroy", "ngDoCheck", "ngAfterViewInit", "ngAfterViewChecked", "ngAfterContentInit", "ngAfterContentChecked"];
function shouldAddAbstractDirective(type) {
  const reflect = getReflect();
  if (LIFECYCLE_HOOKS.some((hookName) => reflect.hasLifecycleHook(type, hookName))) {
    return true;
  }
  const propMetadata = reflect.propMetadata(type);
  for (const field in propMetadata) {
    const annotations = propMetadata[field];
    for (let i = 0; i < annotations.length; i++) {
      const current = annotations[i];
      const metadataName = current.ngMetadataName;
      if (isInputAnnotation(current) || isContentQuery(current) || isViewQuery(current) || metadataName === "Output" || metadataName === "HostBinding" || metadataName === "HostListener") {
        return true;
      }
    }
  }
  return false;
}
function compilePipe(type, meta) {
  let ngPipeDef = null;
  let ngFactoryDef = null;
  Object.defineProperty(type, NG_FACTORY_DEF, {
    get: () => {
      if (ngFactoryDef === null) {
        const metadata = getPipeMetadata(type, meta);
        const compiler = getCompilerFacade({
          usage: 0,
          kind: "pipe",
          type: metadata.type
        });
        ngFactoryDef = compiler.compileFactory(angularCoreEnv, `ng:///${metadata.name}/ɵfac.js`, {
          name: metadata.name,
          type: metadata.type,
          typeArgumentCount: 0,
          deps: reflectDependencies(type),
          target: compiler.FactoryTarget.Pipe
        });
      }
      return ngFactoryDef;
    },
    configurable: !!ngDevMode
  });
  Object.defineProperty(type, NG_PIPE_DEF, {
    get: () => {
      if (ngPipeDef === null) {
        const metadata = getPipeMetadata(type, meta);
        const compiler = getCompilerFacade({
          usage: 0,
          kind: "pipe",
          type: metadata.type
        });
        ngPipeDef = compiler.compilePipe(angularCoreEnv, `ng:///${metadata.name}/ɵpipe.js`, metadata);
      }
      return ngPipeDef;
    },
    configurable: !!ngDevMode
  });
}
function getPipeMetadata(type, meta) {
  return {
    type,
    name: type.name,
    pipeName: meta.name,
    pure: meta.pure !== void 0 ? meta.pure : true,
    isStandalone: meta.standalone === void 0 ? true : !!meta.standalone
  };
}
var Directive = makeDecorator("Directive", (dir = {}) => dir, void 0, void 0, (type, meta) => compileDirective(type, meta));
var Component = makeDecorator("Component", (c = {}) => __spreadValues({
  changeDetection: ChangeDetectionStrategy.Default
}, c), Directive, void 0, (type, meta) => compileComponent(type, meta));
var Pipe = makeDecorator("Pipe", (p) => __spreadValues({
  pure: true
}, p), void 0, void 0, (type, meta) => compilePipe(type, meta));
var Input = makePropDecorator("Input", (arg) => {
  if (!arg) {
    return {};
  }
  return typeof arg === "string" ? {
    alias: arg
  } : arg;
});
var Output = makePropDecorator("Output", (alias) => ({
  alias
}));
var HostBinding = makePropDecorator("HostBinding", (hostPropertyName) => ({
  hostPropertyName
}));
var HostListener = makePropDecorator("HostListener", (eventName, args) => ({
  eventName,
  args
}));
var NgModule = makeDecorator("NgModule", (ngModule) => ngModule, void 0, void 0, (type, meta) => compileNgModule(type, meta));
var ModuleWithComponentFactories = class {
  ngModuleFactory;
  componentFactories;
  constructor(ngModuleFactory, componentFactories) {
    this.ngModuleFactory = ngModuleFactory;
    this.componentFactories = componentFactories;
  }
};
var Compiler = class _Compiler {
  compileModuleSync(moduleType) {
    return new NgModuleFactory2(moduleType);
  }
  compileModuleAsync(moduleType) {
    return Promise.resolve(this.compileModuleSync(moduleType));
  }
  compileModuleAndAllComponentsSync(moduleType) {
    const ngModuleFactory = this.compileModuleSync(moduleType);
    const moduleDef = getNgModuleDef(moduleType);
    const componentFactories = maybeUnwrapFn(moduleDef.declarations).reduce((factories, declaration) => {
      const componentDef = getComponentDef(declaration);
      componentDef && factories.push(new ComponentFactory2(componentDef));
      return factories;
    }, []);
    return new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
  }
  compileModuleAndAllComponentsAsync(moduleType) {
    return Promise.resolve(this.compileModuleAndAllComponentsSync(moduleType));
  }
  clearCache() {
  }
  clearCacheFor(type) {
  }
  getModuleId(moduleType) {
    return void 0;
  }
  static ɵfac = function Compiler_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Compiler)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _Compiler,
    factory: _Compiler.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Compiler, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var COMPILER_OPTIONS = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "compilerOptions" : "");
var CompilerFactory = class {
};
var CONSECUTIVE_MICROTASK_NOTIFICATION_LIMIT = 100;
var consecutiveMicrotaskNotifications = 0;
var stackFromLastFewNotifications = [];
function trackMicrotaskNotificationForDebugging() {
  consecutiveMicrotaskNotifications++;
  if (CONSECUTIVE_MICROTASK_NOTIFICATION_LIMIT - consecutiveMicrotaskNotifications < 5) {
    const stack = new Error().stack;
    if (stack) {
      stackFromLastFewNotifications.push(stack);
    }
  }
  if (consecutiveMicrotaskNotifications === CONSECUTIVE_MICROTASK_NOTIFICATION_LIMIT) {
    throw new RuntimeError(103, "Angular could not stabilize because there were endless change notifications within the browser event loop. The stack from the last several notifications: \n" + stackFromLastFewNotifications.join("\n"));
  }
}
var ChangeDetectionSchedulerImpl = class _ChangeDetectionSchedulerImpl {
  applicationErrorHandler = inject(INTERNAL_APPLICATION_ERROR_HANDLER);
  appRef = inject(ApplicationRef);
  taskService = inject(PendingTasksInternal);
  ngZone = inject(NgZone);
  zonelessEnabled = inject(ZONELESS_ENABLED);
  tracing = inject(TracingService, {
    optional: true
  });
  zoneIsDefined = typeof Zone !== "undefined" && !!Zone.root.run;
  schedulerTickApplyArgs = [{
    data: {
      "__scheduler_tick__": true
    }
  }];
  subscriptions = new Subscription();
  angularZoneId = this.zoneIsDefined ? this.ngZone._inner?.get(angularZoneInstanceIdProperty) : null;
  scheduleInRootZone = !this.zonelessEnabled && this.zoneIsDefined && (inject(SCHEDULE_IN_ROOT_ZONE, {
    optional: true
  }) ?? false);
  cancelScheduledCallback = null;
  useMicrotaskScheduler = false;
  runningTick = false;
  pendingRenderTaskId = null;
  constructor() {
    this.subscriptions.add(this.appRef.afterTick.subscribe(() => {
      const task = this.taskService.add();
      if (!this.runningTick) {
        this.cleanup();
        if (!this.zonelessEnabled || this.appRef.includeAllTestViews) {
          this.taskService.remove(task);
          return;
        }
      }
      this.switchToMicrotaskScheduler();
      this.taskService.remove(task);
    }));
    this.subscriptions.add(this.ngZone.onUnstable.subscribe(() => {
      if (!this.runningTick) {
        this.cleanup();
      }
    }));
  }
  switchToMicrotaskScheduler() {
    this.ngZone.runOutsideAngular(() => {
      const task = this.taskService.add();
      this.useMicrotaskScheduler = true;
      queueMicrotask(() => {
        this.useMicrotaskScheduler = false;
        this.taskService.remove(task);
      });
    });
  }
  notify(source) {
    if (!this.zonelessEnabled && source === 5) {
      return;
    }
    switch (source) {
      case 0: {
        this.appRef.dirtyFlags |= 2;
        break;
      }
      case 3:
      case 2:
      case 4:
      case 5:
      case 1: {
        this.appRef.dirtyFlags |= 4;
        break;
      }
      case 6: {
        this.appRef.dirtyFlags |= 2;
        break;
      }
      case 12: {
        this.appRef.dirtyFlags |= 16;
        break;
      }
      case 13: {
        this.appRef.dirtyFlags |= 2;
        break;
      }
      case 11: {
        break;
      }
      case 9:
      case 8:
      case 7:
      case 10:
      default: {
        this.appRef.dirtyFlags |= 8;
      }
    }
    this.appRef.tracingSnapshot = this.tracing?.snapshot(this.appRef.tracingSnapshot) ?? null;
    if (!this.shouldScheduleTick()) {
      return;
    }
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (this.useMicrotaskScheduler) {
        trackMicrotaskNotificationForDebugging();
      } else {
        consecutiveMicrotaskNotifications = 0;
        stackFromLastFewNotifications.length = 0;
      }
    }
    const scheduleCallback = this.useMicrotaskScheduler ? scheduleCallbackWithMicrotask : scheduleCallbackWithRafRace;
    this.pendingRenderTaskId = this.taskService.add();
    if (this.scheduleInRootZone) {
      this.cancelScheduledCallback = Zone.root.run(() => scheduleCallback(() => this.tick()));
    } else {
      this.cancelScheduledCallback = this.ngZone.runOutsideAngular(() => scheduleCallback(() => this.tick()));
    }
  }
  shouldScheduleTick() {
    if (this.appRef.destroyed) {
      return false;
    }
    if (this.pendingRenderTaskId !== null || this.runningTick || this.appRef._runningTick) {
      return false;
    }
    if (!this.zonelessEnabled && this.zoneIsDefined && Zone.current.get(angularZoneInstanceIdProperty + this.angularZoneId)) {
      return false;
    }
    return true;
  }
  tick() {
    if (this.runningTick || this.appRef.destroyed) {
      return;
    }
    if (this.appRef.dirtyFlags === 0) {
      this.cleanup();
      return;
    }
    if (!this.zonelessEnabled && this.appRef.dirtyFlags & 7) {
      this.appRef.dirtyFlags |= 1;
    }
    const task = this.taskService.add();
    try {
      this.ngZone.run(() => {
        this.runningTick = true;
        this.appRef._tick();
      }, void 0, this.schedulerTickApplyArgs);
    } catch (e) {
      this.applicationErrorHandler(e);
    } finally {
      this.taskService.remove(task);
      this.cleanup();
    }
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.cleanup();
  }
  cleanup() {
    this.runningTick = false;
    this.cancelScheduledCallback?.();
    this.cancelScheduledCallback = null;
    if (this.pendingRenderTaskId !== null) {
      const taskId = this.pendingRenderTaskId;
      this.pendingRenderTaskId = null;
      this.taskService.remove(taskId);
    }
  }
  static ɵfac = function ChangeDetectionSchedulerImpl_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ChangeDetectionSchedulerImpl)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ChangeDetectionSchedulerImpl,
    factory: _ChangeDetectionSchedulerImpl.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChangeDetectionSchedulerImpl, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
function provideZonelessChangeDetection() {
  performanceMarkFeature("NgZoneless");
  if ((typeof ngDevMode === "undefined" || ngDevMode) && typeof Zone !== "undefined" && Zone) {
    const message = formatRuntimeError(914, `The application is using zoneless change detection, but is still loading Zone.js. Consider removing Zone.js to get the full benefits of zoneless. In applications using the Angular CLI, Zone.js is typically included in the "polyfills" section of the angular.json file.`);
    console.warn(message);
  }
  return makeEnvironmentProviders([...provideZonelessChangeDetectionInternal(), typeof ngDevMode === "undefined" || ngDevMode ? [{
    provide: PROVIDED_ZONELESS,
    useValue: true
  }] : []]);
}
function provideZonelessChangeDetectionInternal() {
  return [{
    provide: ChangeDetectionScheduler,
    useExisting: ChangeDetectionSchedulerImpl
  }, {
    provide: NgZone,
    useClass: NoopNgZone
  }, {
    provide: ZONELESS_ENABLED,
    useValue: true
  }];
}
function getGlobalLocale() {
  if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode && typeof goog !== "undefined" && goog.LOCALE !== "en") {
    return goog.LOCALE;
  } else {
    return typeof $localize !== "undefined" && $localize.locale || DEFAULT_LOCALE_ID;
  }
}
var LOCALE_ID = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "LocaleId" : "", {
  factory: () => inject(LOCALE_ID, {
    optional: true,
    skipSelf: true
  }) || getGlobalLocale()
});
var DEFAULT_CURRENCY_CODE = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "DefaultCurrencyCode" : "", {
  factory: () => USD_CURRENCY_CODE
});
var TRANSLATIONS = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "Translations" : "");
var TRANSLATIONS_FORMAT = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "TranslationsFormat" : "");
var MissingTranslationStrategy;
(function(MissingTranslationStrategy2) {
  MissingTranslationStrategy2[MissingTranslationStrategy2["Error"] = 0] = "Error";
  MissingTranslationStrategy2[MissingTranslationStrategy2["Warning"] = 1] = "Warning";
  MissingTranslationStrategy2[MissingTranslationStrategy2["Ignore"] = 2] = "Ignore";
})(MissingTranslationStrategy || (MissingTranslationStrategy = {}));
var DebugEventListener = class {
  name;
  callback;
  constructor(name, callback) {
    this.name = name;
    this.callback = callback;
  }
};
function asNativeElements(debugEls) {
  return debugEls.map((el) => el.nativeElement);
}
var DebugNode = class {
  nativeNode;
  constructor(nativeNode) {
    this.nativeNode = nativeNode;
  }
  get parent() {
    const parent = this.nativeNode.parentNode;
    return parent ? new DebugElement(parent) : null;
  }
  get injector() {
    return getInjector(this.nativeNode);
  }
  get componentInstance() {
    const nativeElement = this.nativeNode;
    return nativeElement && (getComponent(nativeElement) || getOwningComponent(nativeElement));
  }
  get context() {
    return getComponent(this.nativeNode) || getContext(this.nativeNode);
  }
  get listeners() {
    return getListeners(this.nativeNode).filter((listener) => listener.type === "dom");
  }
  get references() {
    return getLocalRefs(this.nativeNode);
  }
  get providerTokens() {
    return getInjectionTokens(this.nativeNode);
  }
};
var DebugElement = class extends DebugNode {
  constructor(nativeNode) {
    ngDevMode && assertDomNode(nativeNode);
    super(nativeNode);
  }
  get nativeElement() {
    return this.nativeNode.nodeType == Node.ELEMENT_NODE ? this.nativeNode : null;
  }
  get name() {
    const context = getLContext(this.nativeNode);
    const lView = context ? context.lView : null;
    if (lView !== null) {
      const tData = lView[TVIEW].data;
      const tNode = tData[context.nodeIndex];
      return tNode.value;
    } else {
      return this.nativeNode.nodeName;
    }
  }
  get properties() {
    const context = getLContext(this.nativeNode);
    const lView = context ? context.lView : null;
    if (lView === null) {
      return {};
    }
    const tData = lView[TVIEW].data;
    const tNode = tData[context.nodeIndex];
    const properties = {};
    copyDomProperties(this.nativeElement, properties);
    collectPropertyBindings(properties, tNode, lView, tData);
    return properties;
  }
  get attributes() {
    const attributes = {};
    const element = this.nativeElement;
    if (!element) {
      return attributes;
    }
    const context = getLContext(element);
    const lView = context ? context.lView : null;
    if (lView === null) {
      return {};
    }
    const tNodeAttrs = lView[TVIEW].data[context.nodeIndex].attrs;
    const lowercaseTNodeAttrs = [];
    if (tNodeAttrs) {
      let i = 0;
      while (i < tNodeAttrs.length) {
        const attrName = tNodeAttrs[i];
        if (typeof attrName !== "string") break;
        const attrValue = tNodeAttrs[i + 1];
        attributes[attrName] = attrValue;
        lowercaseTNodeAttrs.push(attrName.toLowerCase());
        i += 2;
      }
    }
    for (const attr of element.attributes) {
      if (!lowercaseTNodeAttrs.includes(attr.name)) {
        attributes[attr.name] = attr.value;
      }
    }
    return attributes;
  }
  get styles() {
    const element = this.nativeElement;
    return element?.style ?? {};
  }
  get classes() {
    const result = {};
    const element = this.nativeElement;
    const className = element.className;
    const classes = typeof className !== "string" ? className.baseVal.split(" ") : className.split(" ");
    classes.forEach((value) => result[value] = true);
    return result;
  }
  get childNodes() {
    const childNodes = this.nativeNode.childNodes;
    const children = [];
    for (let i = 0; i < childNodes.length; i++) {
      const element = childNodes[i];
      children.push(getDebugNode(element));
    }
    return children;
  }
  get children() {
    const nativeElement = this.nativeElement;
    if (!nativeElement) return [];
    const childNodes = nativeElement.children;
    const children = [];
    for (let i = 0; i < childNodes.length; i++) {
      const element = childNodes[i];
      children.push(getDebugNode(element));
    }
    return children;
  }
  query(predicate) {
    const results = this.queryAll(predicate);
    return results[0] || null;
  }
  queryAll(predicate) {
    const matches = [];
    _queryAll(this, predicate, matches, true);
    return matches;
  }
  queryAllNodes(predicate) {
    const matches = [];
    _queryAll(this, predicate, matches, false);
    return matches;
  }
  triggerEventHandler(eventName, eventObj) {
    const node = this.nativeNode;
    const invokedListeners = [];
    this.listeners.forEach((listener) => {
      if (listener.name === eventName) {
        const callback = listener.callback;
        callback.call(node, eventObj);
        invokedListeners.push(callback);
      }
    });
    if (typeof node.eventListeners === "function") {
      node.eventListeners(eventName).forEach((listener) => {
        if (listener.toString().indexOf("__ngUnwrap__") !== -1) {
          const unwrappedListener = listener("__ngUnwrap__");
          return invokedListeners.indexOf(unwrappedListener) === -1 && unwrappedListener.call(node, eventObj);
        }
      });
    }
  }
};
function copyDomProperties(element, properties) {
  if (element) {
    let obj = Object.getPrototypeOf(element);
    const NodePrototype = Node.prototype;
    while (obj !== null && obj !== NodePrototype) {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      for (let key in descriptors) {
        if (!key.startsWith("__") && !key.startsWith("on")) {
          const value = element[key];
          if (isPrimitiveValue(value)) {
            properties[key] = value;
          }
        }
      }
      obj = Object.getPrototypeOf(obj);
    }
  }
}
function isPrimitiveValue(value) {
  return typeof value === "string" || typeof value === "boolean" || typeof value === "number" || value === null;
}
function _queryAll(parentElement, predicate, matches, elementsOnly) {
  const context = getLContext(parentElement.nativeNode);
  const lView = context ? context.lView : null;
  if (lView !== null) {
    const parentTNode = lView[TVIEW].data[context.nodeIndex];
    _queryNodeChildren(parentTNode, lView, predicate, matches, elementsOnly, parentElement.nativeNode);
  } else {
    _queryNativeNodeDescendants(parentElement.nativeNode, predicate, matches, elementsOnly);
  }
}
function _queryNodeChildren(tNode, lView, predicate, matches, elementsOnly, rootNativeNode) {
  ngDevMode && assertTNodeForLView(tNode, lView);
  const nativeNode = getNativeByTNodeOrNull(tNode, lView);
  if (tNode.type & (3 | 8)) {
    _addQueryMatch(nativeNode, predicate, matches, elementsOnly, rootNativeNode);
    if (isComponentHost(tNode)) {
      const componentView = getComponentLViewByIndex(tNode.index, lView);
      if (componentView && componentView[TVIEW].firstChild) {
        _queryNodeChildren(componentView[TVIEW].firstChild, componentView, predicate, matches, elementsOnly, rootNativeNode);
      }
    } else {
      if (tNode.child) {
        _queryNodeChildren(tNode.child, lView, predicate, matches, elementsOnly, rootNativeNode);
      }
      nativeNode && _queryNativeNodeDescendants(nativeNode, predicate, matches, elementsOnly);
    }
    const nodeOrContainer = lView[tNode.index];
    if (isLContainer(nodeOrContainer)) {
      _queryNodeChildrenInContainer(nodeOrContainer, predicate, matches, elementsOnly, rootNativeNode);
    }
  } else if (tNode.type & 4) {
    const lContainer = lView[tNode.index];
    _addQueryMatch(lContainer[NATIVE], predicate, matches, elementsOnly, rootNativeNode);
    _queryNodeChildrenInContainer(lContainer, predicate, matches, elementsOnly, rootNativeNode);
  } else if (tNode.type & 16) {
    const componentView = lView[DECLARATION_COMPONENT_VIEW];
    const componentHost = componentView[T_HOST];
    const head = componentHost.projection[tNode.projection];
    if (Array.isArray(head)) {
      for (let nativeNode2 of head) {
        _addQueryMatch(nativeNode2, predicate, matches, elementsOnly, rootNativeNode);
      }
    } else if (head) {
      const nextLView = componentView[PARENT];
      const nextTNode = nextLView[TVIEW].data[head.index];
      _queryNodeChildren(nextTNode, nextLView, predicate, matches, elementsOnly, rootNativeNode);
    }
  } else if (tNode.child) {
    _queryNodeChildren(tNode.child, lView, predicate, matches, elementsOnly, rootNativeNode);
  }
  if (rootNativeNode !== nativeNode) {
    const nextTNode = tNode.flags & 2 ? tNode.projectionNext : tNode.next;
    if (nextTNode) {
      _queryNodeChildren(nextTNode, lView, predicate, matches, elementsOnly, rootNativeNode);
    }
  }
}
function _queryNodeChildrenInContainer(lContainer, predicate, matches, elementsOnly, rootNativeNode) {
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    const childView = lContainer[i];
    const firstChild = childView[TVIEW].firstChild;
    if (firstChild) {
      _queryNodeChildren(firstChild, childView, predicate, matches, elementsOnly, rootNativeNode);
    }
  }
}
function _addQueryMatch(nativeNode, predicate, matches, elementsOnly, rootNativeNode) {
  if (rootNativeNode !== nativeNode) {
    const debugNode = getDebugNode(nativeNode);
    if (!debugNode) {
      return;
    }
    if (elementsOnly && debugNode instanceof DebugElement && predicate(debugNode) && matches.indexOf(debugNode) === -1) {
      matches.push(debugNode);
    } else if (!elementsOnly && predicate(debugNode) && matches.indexOf(debugNode) === -1) {
      matches.push(debugNode);
    }
  }
}
function _queryNativeNodeDescendants(parentNode, predicate, matches, elementsOnly) {
  const nodes = parentNode.childNodes;
  const length = nodes.length;
  for (let i = 0; i < length; i++) {
    const node = nodes[i];
    const debugNode = getDebugNode(node);
    if (debugNode) {
      if (elementsOnly && debugNode instanceof DebugElement && predicate(debugNode) && matches.indexOf(debugNode) === -1) {
        matches.push(debugNode);
      } else if (!elementsOnly && predicate(debugNode) && matches.indexOf(debugNode) === -1) {
        matches.push(debugNode);
      }
      _queryNativeNodeDescendants(node, predicate, matches, elementsOnly);
    }
  }
}
function collectPropertyBindings(properties, tNode, lView, tData) {
  let bindingIndexes = tNode.propertyBindings;
  if (bindingIndexes !== null) {
    for (let i = 0; i < bindingIndexes.length; i++) {
      const bindingIndex = bindingIndexes[i];
      const propMetadata = tData[bindingIndex];
      const metadataParts = propMetadata.split(INTERPOLATION_DELIMITER);
      const propertyName = metadataParts[0];
      if (metadataParts.length > 1) {
        let value = metadataParts[1];
        for (let j = 1; j < metadataParts.length - 1; j++) {
          value += renderStringify(lView[bindingIndex + j - 1]) + metadataParts[j + 1];
        }
        properties[propertyName] = value;
      } else {
        properties[propertyName] = lView[bindingIndex];
      }
    }
  }
}
var NG_DEBUG_PROPERTY = "__ng_debug__";
function getDebugNode(nativeNode) {
  if (nativeNode instanceof Node) {
    if (!nativeNode.hasOwnProperty(NG_DEBUG_PROPERTY)) {
      nativeNode[NG_DEBUG_PROPERTY] = nativeNode.nodeType == Node.ELEMENT_NODE ? new DebugElement(nativeNode) : new DebugNode(nativeNode);
    }
    return nativeNode[NG_DEBUG_PROPERTY];
  }
  return null;
}

// node_modules/@angular/core/fesm2022/primitives-event-dispatch.mjs
var Property = {
  JSACTION: "__jsaction",
  OWNER: "__owner"
};
var parseCache = {};
function get(element) {
  return element[Property.JSACTION];
}
function set(element, actionMap) {
  element[Property.JSACTION] = actionMap;
}
function getParsed(text) {
  return parseCache[text];
}
function setParsed(text, parsed) {
  parseCache[text] = parsed;
}
var EventType = {
  AUXCLICK: "auxclick",
  CHANGE: "change",
  CLICK: "click",
  CLICKMOD: "clickmod",
  CLICKONLY: "clickonly",
  DBLCLICK: "dblclick",
  FOCUS: "focus",
  FOCUSIN: "focusin",
  BLUR: "blur",
  FOCUSOUT: "focusout",
  SUBMIT: "submit",
  KEYDOWN: "keydown",
  KEYPRESS: "keypress",
  KEYUP: "keyup",
  MOUSEUP: "mouseup",
  MOUSEDOWN: "mousedown",
  MOUSEOVER: "mouseover",
  MOUSEOUT: "mouseout",
  MOUSEENTER: "mouseenter",
  MOUSELEAVE: "mouseleave",
  MOUSEMOVE: "mousemove",
  POINTERUP: "pointerup",
  POINTERDOWN: "pointerdown",
  POINTEROVER: "pointerover",
  POINTEROUT: "pointerout",
  POINTERENTER: "pointerenter",
  POINTERLEAVE: "pointerleave",
  POINTERMOVE: "pointermove",
  POINTERCANCEL: "pointercancel",
  GOTPOINTERCAPTURE: "gotpointercapture",
  LOSTPOINTERCAPTURE: "lostpointercapture",
  ERROR: "error",
  LOAD: "load",
  UNLOAD: "unload",
  TOUCHSTART: "touchstart",
  TOUCHEND: "touchend",
  TOUCHMOVE: "touchmove",
  INPUT: "input",
  SCROLL: "scroll",
  TOGGLE: "toggle",
  CUSTOM: "_custom"
};
var MOUSE_SPECIAL_EVENT_TYPES = [EventType.MOUSEENTER, EventType.MOUSELEAVE, "pointerenter", "pointerleave"];
var BUBBLE_EVENT_TYPES = [EventType.CLICK, EventType.DBLCLICK, EventType.FOCUSIN, EventType.FOCUSOUT, EventType.KEYDOWN, EventType.KEYUP, EventType.KEYPRESS, EventType.MOUSEOVER, EventType.MOUSEOUT, EventType.SUBMIT, EventType.TOUCHSTART, EventType.TOUCHEND, EventType.TOUCHMOVE, "touchcancel", "auxclick", "change", "compositionstart", "compositionupdate", "compositionend", "beforeinput", "input", "select", "copy", "cut", "paste", "mousedown", "mouseup", "wheel", "contextmenu", "dragover", "dragenter", "dragleave", "drop", "dragstart", "dragend", "pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout", "gotpointercapture", "lostpointercapture", "ended", "loadedmetadata", "pagehide", "pageshow", "visibilitychange", "beforematch"];
var CAPTURE_EVENT_TYPES = [EventType.FOCUS, EventType.BLUR, EventType.ERROR, EventType.LOAD, EventType.TOGGLE];
var isCaptureEventType = (eventType) => CAPTURE_EVENT_TYPES.indexOf(eventType) >= 0;
var EARLY_EVENT_TYPES = BUBBLE_EVENT_TYPES.concat(CAPTURE_EVENT_TYPES);
var isEarlyEventType = (eventType) => EARLY_EVENT_TYPES.indexOf(eventType) >= 0;
function getBrowserEventType(eventType) {
  if (eventType === EventType.MOUSEENTER) {
    return EventType.MOUSEOVER;
  } else if (eventType === EventType.MOUSELEAVE) {
    return EventType.MOUSEOUT;
  } else if (eventType === EventType.POINTERENTER) {
    return EventType.POINTEROVER;
  } else if (eventType === EventType.POINTERLEAVE) {
    return EventType.POINTEROUT;
  }
  return eventType;
}
function addEventListener(element, eventType, handler, passive) {
  let capture = false;
  if (isCaptureEventType(eventType)) {
    capture = true;
  }
  const options = typeof passive === "boolean" ? {
    capture,
    passive
  } : capture;
  element.addEventListener(eventType, handler, options);
  return {
    eventType,
    handler,
    capture,
    passive
  };
}
function removeEventListener(element, info) {
  if (element.removeEventListener) {
    const options = typeof info.passive === "boolean" ? {
      capture: info.capture
    } : info.capture;
    element.removeEventListener(info.eventType, info.handler, options);
  } else if (element.detachEvent) {
    element.detachEvent(`on${info.eventType}`, info.handler);
  }
}
function preventDefault(e) {
  e.preventDefault ? e.preventDefault() : e.returnValue = false;
}
var isMac = typeof navigator !== "undefined" && /Macintosh/.test(navigator.userAgent);
function isMiddleClick(e) {
  return e.which === 2 || e.which == null && e.button === 4;
}
function isModifiedClickEvent(e) {
  return isMac && e.metaKey || !isMac && e.ctrlKey || isMiddleClick(e) || e.shiftKey;
}
function isMouseSpecialEvent(e, type, element) {
  const related = e.relatedTarget;
  return (e.type === EventType.MOUSEOVER && type === EventType.MOUSEENTER || e.type === EventType.MOUSEOUT && type === EventType.MOUSELEAVE || e.type === EventType.POINTEROVER && type === EventType.POINTERENTER || e.type === EventType.POINTEROUT && type === EventType.POINTERLEAVE) && (!related || related !== element && !element.contains(related));
}
function createMouseSpecialEvent(e, target) {
  const copy = {};
  for (const property in e) {
    if (property === "srcElement" || property === "target") {
      continue;
    }
    const key = property;
    const value = e[key];
    if (typeof value === "function") {
      continue;
    }
    copy[key] = value;
  }
  if (e.type === EventType.MOUSEOVER) {
    copy["type"] = EventType.MOUSEENTER;
  } else if (e.type === EventType.MOUSEOUT) {
    copy["type"] = EventType.MOUSELEAVE;
  } else if (e.type === EventType.POINTEROVER) {
    copy["type"] = EventType.POINTERENTER;
  } else {
    copy["type"] = EventType.POINTERLEAVE;
  }
  copy["target"] = copy["srcElement"] = target;
  copy["bubbles"] = false;
  copy["_originalEvent"] = e;
  return copy;
}
var isIos = typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
var EventContractContainer = class {
  element;
  handlerInfos = [];
  constructor(element) {
    this.element = element;
  }
  addEventListener(eventType, getHandler, passive) {
    if (isIos) {
      this.element.style.cursor = "pointer";
    }
    this.handlerInfos.push(addEventListener(this.element, eventType, getHandler(this.element), passive));
  }
  cleanUp() {
    for (let i = 0; i < this.handlerInfos.length; i++) {
      removeEventListener(this.element, this.handlerInfos[i]);
    }
    this.handlerInfos = [];
  }
};
var Char = {
  NAMESPACE_ACTION_SEPARATOR: ".",
  EVENT_ACTION_SEPARATOR: ":"
};
function getEventType(eventInfo) {
  return eventInfo.eventType;
}
function setEventType(eventInfo, eventType) {
  eventInfo.eventType = eventType;
}
function getEvent(eventInfo) {
  return eventInfo.event;
}
function setEvent(eventInfo, event) {
  eventInfo.event = event;
}
function getTargetElement(eventInfo) {
  return eventInfo.targetElement;
}
function setTargetElement(eventInfo, targetElement) {
  eventInfo.targetElement = targetElement;
}
function getContainer(eventInfo) {
  return eventInfo.eic;
}
function setContainer(eventInfo, container) {
  eventInfo.eic = container;
}
function getTimestamp(eventInfo) {
  return eventInfo.timeStamp;
}
function setTimestamp(eventInfo, timestamp) {
  eventInfo.timeStamp = timestamp;
}
function getAction(eventInfo) {
  return eventInfo.eia;
}
function setAction(eventInfo, actionName, actionElement) {
  eventInfo.eia = [actionName, actionElement];
}
function unsetAction(eventInfo) {
  eventInfo.eia = void 0;
}
function getActionElement(actionInfo) {
  return actionInfo[1];
}
function getIsReplay(eventInfo) {
  return eventInfo.eirp;
}
function setIsReplay(eventInfo, replay) {
  eventInfo.eirp = replay;
}
function getResolved(eventInfo) {
  return eventInfo.eir;
}
function setResolved(eventInfo, resolved) {
  eventInfo.eir = resolved;
}
function cloneEventInfo(eventInfo) {
  return {
    eventType: eventInfo.eventType,
    event: eventInfo.event,
    targetElement: eventInfo.targetElement,
    eic: eventInfo.eic,
    eia: eventInfo.eia,
    timeStamp: eventInfo.timeStamp,
    eirp: eventInfo.eirp,
    eiack: eventInfo.eiack,
    eir: eventInfo.eir
  };
}
function createEventInfoFromParameters(eventType, event, targetElement, container, timestamp, action, isReplay, a11yClickKey) {
  return {
    eventType,
    event,
    targetElement,
    eic: container,
    timeStamp: timestamp,
    eia: action,
    eirp: isReplay,
    eiack: a11yClickKey
  };
}
var EventInfoWrapper = class _EventInfoWrapper {
  eventInfo;
  constructor(eventInfo) {
    this.eventInfo = eventInfo;
  }
  getEventType() {
    return getEventType(this.eventInfo);
  }
  setEventType(eventType) {
    setEventType(this.eventInfo, eventType);
  }
  getEvent() {
    return getEvent(this.eventInfo);
  }
  setEvent(event) {
    setEvent(this.eventInfo, event);
  }
  getTargetElement() {
    return getTargetElement(this.eventInfo);
  }
  setTargetElement(targetElement) {
    setTargetElement(this.eventInfo, targetElement);
  }
  getContainer() {
    return getContainer(this.eventInfo);
  }
  setContainer(container) {
    setContainer(this.eventInfo, container);
  }
  getTimestamp() {
    return getTimestamp(this.eventInfo);
  }
  setTimestamp(timestamp) {
    setTimestamp(this.eventInfo, timestamp);
  }
  getAction() {
    const action = getAction(this.eventInfo);
    if (!action) return void 0;
    return {
      name: action[0],
      element: action[1]
    };
  }
  setAction(action) {
    if (!action) {
      unsetAction(this.eventInfo);
      return;
    }
    setAction(this.eventInfo, action.name, action.element);
  }
  getIsReplay() {
    return getIsReplay(this.eventInfo);
  }
  setIsReplay(replay) {
    setIsReplay(this.eventInfo, replay);
  }
  getResolved() {
    return getResolved(this.eventInfo);
  }
  setResolved(resolved) {
    setResolved(this.eventInfo, resolved);
  }
  clone() {
    return new _EventInfoWrapper(cloneEventInfo(this.eventInfo));
  }
};
var EMPTY_ACTION_MAP = {};
var REGEXP_SEMICOLON = /\s*;\s*/;
var DEFAULT_EVENT_TYPE = EventType.CLICK;
var ActionResolver = class {
  a11yClickSupport = false;
  clickModSupport = true;
  syntheticMouseEventSupport;
  updateEventInfoForA11yClick = void 0;
  preventDefaultForA11yClick = void 0;
  populateClickOnlyAction = void 0;
  constructor({
    syntheticMouseEventSupport = false,
    clickModSupport = true
  } = {}) {
    this.syntheticMouseEventSupport = syntheticMouseEventSupport;
    this.clickModSupport = clickModSupport;
  }
  resolveEventType(eventInfo) {
    if (this.clickModSupport && getEventType(eventInfo) === EventType.CLICK && isModifiedClickEvent(getEvent(eventInfo))) {
      setEventType(eventInfo, EventType.CLICKMOD);
    } else if (this.a11yClickSupport) {
      this.updateEventInfoForA11yClick(eventInfo);
    }
  }
  resolveAction(eventInfo) {
    if (getResolved(eventInfo)) {
      return;
    }
    this.populateAction(eventInfo, getTargetElement(eventInfo));
    setResolved(eventInfo, true);
  }
  resolveParentAction(eventInfo) {
    const action = getAction(eventInfo);
    const actionElement = action && getActionElement(action);
    unsetAction(eventInfo);
    const parentNode = actionElement && this.getParentNode(actionElement);
    if (!parentNode) {
      return;
    }
    this.populateAction(eventInfo, parentNode);
  }
  populateAction(eventInfo, currentTarget) {
    let actionElement = currentTarget;
    while (actionElement && actionElement !== getContainer(eventInfo)) {
      if (actionElement.nodeType === Node.ELEMENT_NODE) {
        this.populateActionOnElement(actionElement, eventInfo);
      }
      if (getAction(eventInfo)) {
        break;
      }
      actionElement = this.getParentNode(actionElement);
    }
    const action = getAction(eventInfo);
    if (!action) {
      return;
    }
    if (this.a11yClickSupport) {
      this.preventDefaultForA11yClick(eventInfo);
    }
    if (this.syntheticMouseEventSupport) {
      if (getEventType(eventInfo) === EventType.MOUSEENTER || getEventType(eventInfo) === EventType.MOUSELEAVE || getEventType(eventInfo) === EventType.POINTERENTER || getEventType(eventInfo) === EventType.POINTERLEAVE) {
        if (isMouseSpecialEvent(getEvent(eventInfo), getEventType(eventInfo), getActionElement(action))) {
          const copiedEvent = createMouseSpecialEvent(getEvent(eventInfo), getActionElement(action));
          setEvent(eventInfo, copiedEvent);
          setTargetElement(eventInfo, getActionElement(action));
        } else {
          unsetAction(eventInfo);
        }
      }
    }
  }
  getParentNode(element) {
    const owner = element[Property.OWNER];
    if (owner) {
      return owner;
    }
    const parentNode = element.parentNode;
    if (parentNode?.nodeName === "#document-fragment") {
      return parentNode?.host ?? null;
    }
    return parentNode;
  }
  populateActionOnElement(actionElement, eventInfo) {
    const actionMap = this.parseActions(actionElement);
    const actionName = actionMap[getEventType(eventInfo)];
    if (actionName !== void 0) {
      setAction(eventInfo, actionName, actionElement);
    }
    if (this.a11yClickSupport) {
      this.populateClickOnlyAction(actionElement, eventInfo, actionMap);
    }
  }
  parseActions(actionElement) {
    let actionMap = get(actionElement);
    if (!actionMap) {
      const jsactionAttribute = actionElement.getAttribute(Attribute.JSACTION);
      if (!jsactionAttribute) {
        actionMap = EMPTY_ACTION_MAP;
        set(actionElement, actionMap);
      } else {
        actionMap = getParsed(jsactionAttribute);
        if (!actionMap) {
          actionMap = {};
          const values = jsactionAttribute.split(REGEXP_SEMICOLON);
          for (let idx = 0; idx < values.length; idx++) {
            const value = values[idx];
            if (!value) {
              continue;
            }
            const colon = value.indexOf(Char.EVENT_ACTION_SEPARATOR);
            const hasColon = colon !== -1;
            const type = hasColon ? value.substr(0, colon).trim() : DEFAULT_EVENT_TYPE;
            const action = hasColon ? value.substr(colon + 1).trim() : value;
            actionMap[type] = action;
          }
          setParsed(jsactionAttribute, actionMap);
        }
        set(actionElement, actionMap);
      }
    }
    return actionMap;
  }
  addA11yClickSupport(updateEventInfoForA11yClick, preventDefaultForA11yClick, populateClickOnlyAction) {
    this.a11yClickSupport = true;
    this.updateEventInfoForA11yClick = updateEventInfoForA11yClick;
    this.preventDefaultForA11yClick = preventDefaultForA11yClick;
    this.populateClickOnlyAction = populateClickOnlyAction;
  }
};
var Restriction;
(function(Restriction2) {
  Restriction2[Restriction2["I_AM_THE_JSACTION_FRAMEWORK"] = 0] = "I_AM_THE_JSACTION_FRAMEWORK";
})(Restriction || (Restriction = {}));
var Dispatcher = class {
  dispatchDelegate;
  actionResolver;
  eventReplayer;
  eventReplayScheduled = false;
  replayEventInfoWrappers = [];
  constructor(dispatchDelegate, {
    actionResolver,
    eventReplayer
  } = {}) {
    this.dispatchDelegate = dispatchDelegate;
    this.actionResolver = actionResolver;
    this.eventReplayer = eventReplayer;
  }
  dispatch(eventInfo) {
    const eventInfoWrapper = new EventInfoWrapper(eventInfo);
    this.actionResolver?.resolveEventType(eventInfo);
    this.actionResolver?.resolveAction(eventInfo);
    const action = eventInfoWrapper.getAction();
    if (action && shouldPreventDefaultBeforeDispatching(action.element, eventInfoWrapper)) {
      preventDefault(eventInfoWrapper.getEvent());
    }
    if (this.eventReplayer && eventInfoWrapper.getIsReplay()) {
      this.scheduleEventInfoWrapperReplay(eventInfoWrapper);
      return;
    }
    this.dispatchDelegate(eventInfoWrapper);
  }
  scheduleEventInfoWrapperReplay(eventInfoWrapper) {
    this.replayEventInfoWrappers.push(eventInfoWrapper);
    if (this.eventReplayScheduled) {
      return;
    }
    this.eventReplayScheduled = true;
    Promise.resolve().then(() => {
      this.eventReplayScheduled = false;
      this.eventReplayer(this.replayEventInfoWrappers);
    });
  }
};
function shouldPreventDefaultBeforeDispatching(actionElement, eventInfoWrapper) {
  return actionElement.tagName === "A" && (eventInfoWrapper.getEventType() === EventType.CLICK || eventInfoWrapper.getEventType() === EventType.CLICKMOD);
}
var PROPAGATION_STOPPED_SYMBOL = /* @__PURE__ */ Symbol.for("propagationStopped");
var EventPhase = {
  REPLAY: 101
};
var PREVENT_DEFAULT_ERROR_MESSAGE_DETAILS = " Because event replay occurs after browser dispatch, `preventDefault` would have no effect. You can check whether an event is being replayed by accessing the event phase: `event.eventPhase === EventPhase.REPLAY`.";
var PREVENT_DEFAULT_ERROR_MESSAGE = `\`preventDefault\` called during event replay.`;
var COMPOSED_PATH_ERROR_MESSAGE_DETAILS = " Because event replay occurs after browser dispatch, `composedPath()` will be empty. Iterate parent nodes from `event.target` or `event.currentTarget` if you need to check elements in the event path.";
var COMPOSED_PATH_ERROR_MESSAGE = `\`composedPath\` called during event replay.`;
var EventDispatcher = class {
  dispatchDelegate;
  clickModSupport;
  actionResolver;
  dispatcher;
  constructor(dispatchDelegate, clickModSupport = true) {
    this.dispatchDelegate = dispatchDelegate;
    this.clickModSupport = clickModSupport;
    this.actionResolver = new ActionResolver({
      clickModSupport
    });
    this.dispatcher = new Dispatcher((eventInfoWrapper) => {
      this.dispatchToDelegate(eventInfoWrapper);
    }, {
      actionResolver: this.actionResolver
    });
  }
  dispatch(eventInfo) {
    this.dispatcher.dispatch(eventInfo);
  }
  dispatchToDelegate(eventInfoWrapper) {
    if (eventInfoWrapper.getIsReplay()) {
      prepareEventForReplay(eventInfoWrapper);
    }
    prepareEventForBubbling(eventInfoWrapper);
    while (eventInfoWrapper.getAction()) {
      prepareEventForDispatch(eventInfoWrapper);
      if (isCaptureEventType(eventInfoWrapper.getEventType()) && eventInfoWrapper.getAction().element !== eventInfoWrapper.getTargetElement()) {
        return;
      }
      this.dispatchDelegate(eventInfoWrapper.getEvent(), eventInfoWrapper.getAction().name);
      if (propagationStopped(eventInfoWrapper)) {
        return;
      }
      this.actionResolver.resolveParentAction(eventInfoWrapper.eventInfo);
    }
  }
};
function prepareEventForBubbling(eventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  const originalStopPropagation = eventInfoWrapper.getEvent().stopPropagation.bind(event);
  const stopPropagation = () => {
    event[PROPAGATION_STOPPED_SYMBOL] = true;
    originalStopPropagation();
  };
  patchEventInstance(event, "stopPropagation", stopPropagation);
  patchEventInstance(event, "stopImmediatePropagation", stopPropagation);
}
function propagationStopped(eventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  return !!event[PROPAGATION_STOPPED_SYMBOL];
}
function prepareEventForReplay(eventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  const target = eventInfoWrapper.getTargetElement();
  const originalPreventDefault = event.preventDefault.bind(event);
  patchEventInstance(event, "target", target);
  patchEventInstance(event, "eventPhase", EventPhase.REPLAY);
  patchEventInstance(event, "preventDefault", () => {
    originalPreventDefault();
    throw new Error(PREVENT_DEFAULT_ERROR_MESSAGE + (ngDevMode ? PREVENT_DEFAULT_ERROR_MESSAGE_DETAILS : ""));
  });
  patchEventInstance(event, "composedPath", () => {
    throw new Error(COMPOSED_PATH_ERROR_MESSAGE + (ngDevMode ? COMPOSED_PATH_ERROR_MESSAGE_DETAILS : ""));
  });
}
function prepareEventForDispatch(eventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  const currentTarget = eventInfoWrapper.getAction()?.element;
  if (currentTarget) {
    patchEventInstance(event, "currentTarget", currentTarget, {
      configurable: true
    });
  }
}
function patchEventInstance(event, property, value, {
  configurable = false
} = {}) {
  Object.defineProperty(event, property, {
    value,
    configurable
  });
}
function registerDispatcher$1(eventContract, dispatcher) {
  eventContract.ecrd((eventInfo) => {
    dispatcher.dispatch(eventInfo);
  }, Restriction.I_AM_THE_JSACTION_FRAMEWORK);
}
function getQueuedEventInfos(earlyJsactionData) {
  return earlyJsactionData?.q ?? [];
}
function removeAllEventListeners(earlyJsactionData) {
  if (!earlyJsactionData) {
    return;
  }
  removeEventListeners(earlyJsactionData.c, earlyJsactionData.et, earlyJsactionData.h);
  removeEventListeners(earlyJsactionData.c, earlyJsactionData.etc, earlyJsactionData.h, true);
}
function removeEventListeners(container, eventTypes, earlyEventHandler, capture) {
  for (let i = 0; i < eventTypes.length; i++) {
    container.removeEventListener(eventTypes[i], earlyEventHandler, capture);
  }
}
var MOUSE_SPECIAL_SUPPORT = false;
var EventContract = class _EventContract {
  static MOUSE_SPECIAL_SUPPORT = MOUSE_SPECIAL_SUPPORT;
  containerManager;
  eventHandlers = {};
  browserEventTypeToExtraEventTypes = {};
  dispatcher = null;
  queuedEventInfos = [];
  constructor(containerManager) {
    this.containerManager = containerManager;
  }
  handleEvent(eventType, event, container) {
    const eventInfo = createEventInfoFromParameters(eventType, event, event.target, container, Date.now());
    this.handleEventInfo(eventInfo);
  }
  handleEventInfo(eventInfo) {
    if (!this.dispatcher) {
      setIsReplay(eventInfo, true);
      this.queuedEventInfos?.push(eventInfo);
      return;
    }
    this.dispatcher(eventInfo);
  }
  addEvent(eventType, prefixedEventType, passive) {
    if (eventType in this.eventHandlers || !this.containerManager) {
      return;
    }
    if (!_EventContract.MOUSE_SPECIAL_SUPPORT && MOUSE_SPECIAL_EVENT_TYPES.indexOf(eventType) >= 0) {
      return;
    }
    const eventHandler = (eventType2, event, container) => {
      this.handleEvent(eventType2, event, container);
    };
    this.eventHandlers[eventType] = eventHandler;
    const browserEventType = getBrowserEventType(prefixedEventType || eventType);
    if (browserEventType !== eventType) {
      const eventTypes = this.browserEventTypeToExtraEventTypes[browserEventType] || [];
      eventTypes.push(eventType);
      this.browserEventTypeToExtraEventTypes[browserEventType] = eventTypes;
    }
    this.containerManager.addEventListener(browserEventType, (element) => {
      return (event) => {
        eventHandler(eventType, event, element);
      };
    }, passive);
  }
  replayEarlyEvents(earlyJsactionData = window._ejsa) {
    if (!earlyJsactionData) {
      return;
    }
    this.replayEarlyEventInfos(earlyJsactionData.q);
    removeAllEventListeners(earlyJsactionData);
    delete window._ejsa;
  }
  replayEarlyEventInfos(earlyEventInfos) {
    for (let i = 0; i < earlyEventInfos.length; i++) {
      const earlyEventInfo = earlyEventInfos[i];
      const eventTypes = this.getEventTypesForBrowserEventType(earlyEventInfo.eventType);
      for (let j = 0; j < eventTypes.length; j++) {
        const eventInfo = cloneEventInfo(earlyEventInfo);
        setEventType(eventInfo, eventTypes[j]);
        this.handleEventInfo(eventInfo);
      }
    }
  }
  getEventTypesForBrowserEventType(browserEventType) {
    const eventTypes = [];
    if (this.eventHandlers[browserEventType]) {
      eventTypes.push(browserEventType);
    }
    if (this.browserEventTypeToExtraEventTypes[browserEventType]) {
      eventTypes.push(...this.browserEventTypeToExtraEventTypes[browserEventType]);
    }
    return eventTypes;
  }
  handler(eventType) {
    return this.eventHandlers[eventType];
  }
  cleanUp() {
    this.containerManager?.cleanUp();
    this.containerManager = null;
    this.eventHandlers = {};
    this.browserEventTypeToExtraEventTypes = {};
    this.dispatcher = null;
    this.queuedEventInfos = [];
  }
  registerDispatcher(dispatcher, restriction) {
    this.ecrd(dispatcher, restriction);
  }
  ecrd(dispatcher, restriction) {
    this.dispatcher = dispatcher;
    if (this.queuedEventInfos?.length) {
      for (let i = 0; i < this.queuedEventInfos.length; i++) {
        this.handleEventInfo(this.queuedEventInfos[i]);
      }
      this.queuedEventInfos = null;
    }
  }
};
function getAppScopedQueuedEventInfos(appId, dataContainer = window) {
  return getQueuedEventInfos(dataContainer._ejsas?.[appId]);
}
function clearAppScopedEarlyEventContract(appId, dataContainer = window) {
  if (!dataContainer._ejsas) {
    return;
  }
  dataContainer._ejsas[appId] = void 0;
}

// node_modules/@angular/core/fesm2022/core.mjs
var REQUIRED_UNSET_VALUE = /* @__PURE__ */ Symbol("InputSignalNode#UNSET");
var INPUT_SIGNAL_NODE = (() => {
  return __spreadProps(__spreadValues({}, SIGNAL_NODE), {
    transformFn: void 0,
    applyValueToInputSignal(node, value) {
      signalSetFn(node, value);
    }
  });
})();
var ɵINPUT_SIGNAL_BRAND_WRITE_TYPE = /* @__PURE__ */ Symbol();
function createInputSignal(initialValue, options) {
  const node = Object.create(INPUT_SIGNAL_NODE);
  node.value = initialValue;
  node.transformFn = options?.transform;
  function inputValueFn() {
    producerAccessed(node);
    if (node.value === REQUIRED_UNSET_VALUE) {
      let message = null;
      if (ngDevMode) {
        const name = options?.debugName ?? options?.alias;
        message = `Input${name ? ` "${name}"` : ""} is required but no value is available yet.`;
      }
      throw new RuntimeError(-950, message);
    }
    return node.value;
  }
  inputValueFn[SIGNAL] = node;
  if (ngDevMode) {
    inputValueFn.toString = () => `[Input Signal: ${inputValueFn()}]`;
    node.debugName = options?.debugName;
  }
  return inputValueFn;
}
var FactoryTarget;
(function(FactoryTarget2) {
  FactoryTarget2[FactoryTarget2["Directive"] = 0] = "Directive";
  FactoryTarget2[FactoryTarget2["Component"] = 1] = "Component";
  FactoryTarget2[FactoryTarget2["Injectable"] = 2] = "Injectable";
  FactoryTarget2[FactoryTarget2["Pipe"] = 3] = "Pipe";
  FactoryTarget2[FactoryTarget2["NgModule"] = 4] = "NgModule";
})(FactoryTarget || (FactoryTarget = {}));
var R3TemplateDependencyKind;
(function(R3TemplateDependencyKind2) {
  R3TemplateDependencyKind2[R3TemplateDependencyKind2["Directive"] = 0] = "Directive";
  R3TemplateDependencyKind2[R3TemplateDependencyKind2["Pipe"] = 1] = "Pipe";
  R3TemplateDependencyKind2[R3TemplateDependencyKind2["NgModule"] = 2] = "NgModule";
})(R3TemplateDependencyKind || (R3TemplateDependencyKind = {}));
var ViewEncapsulation2;
(function(ViewEncapsulation3) {
  ViewEncapsulation3[ViewEncapsulation3["Emulated"] = 0] = "Emulated";
  ViewEncapsulation3[ViewEncapsulation3["None"] = 2] = "None";
  ViewEncapsulation3[ViewEncapsulation3["ShadowDom"] = 3] = "ShadowDom";
  ViewEncapsulation3[ViewEncapsulation3["ExperimentalIsolatedShadowDom"] = 4] = "ExperimentalIsolatedShadowDom";
})(ViewEncapsulation2 || (ViewEncapsulation2 = {}));
var Framework;
(function(Framework2) {
  Framework2["Angular"] = "angular";
  Framework2["ACX"] = "acx";
  Framework2["Wiz"] = "wiz";
})(Framework || (Framework = {}));
var HostAttributeToken = class {
  attributeName;
  constructor(attributeName2) {
    this.attributeName = attributeName2;
  }
  __NG_ELEMENT_ID__ = () => ɵɵinjectAttribute(this.attributeName);
  toString() {
    return `HostAttributeToken ${this.attributeName}`;
  }
};
var HOST_TAG_NAME = (() => {
  const HOST_TAG_NAME_TOKEN = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "HOST_TAG_NAME" : "");
  HOST_TAG_NAME_TOKEN.__NG_ELEMENT_ID__ = (flags) => {
    const tNode = getCurrentTNode();
    if (tNode === null) {
      throw new RuntimeError(204, ngDevMode && "HOST_TAG_NAME can only be injected in directives and components during construction time (in a class constructor or as a class field initializer)");
    }
    if (tNode.type & 2) {
      return tNode.value;
    }
    if (flags & 8) {
      return null;
    }
    throw new RuntimeError(204, ngDevMode && `HOST_TAG_NAME was used on ${getDevModeNodeName(tNode)} which doesn't have an underlying element in the DOM. This is invalid, and so the dependency should be marked as optional.`);
  };
  return HOST_TAG_NAME_TOKEN;
})();
function getDevModeNodeName(tNode) {
  if (tNode.type & 8) {
    return "an <ng-container>";
  } else if (tNode.type & 4) {
    return "an <ng-template>";
  } else if (tNode.type & 128) {
    return "an @let declaration";
  } else {
    return "a node";
  }
}
function output(opts) {
  ngDevMode && assertInInjectionContext(output);
  return new OutputEmitterRef();
}
function inputFunction(initialValue, opts) {
  ngDevMode && assertInInjectionContext(input);
  return createInputSignal(initialValue, opts);
}
function inputRequiredFunction(opts) {
  ngDevMode && assertInInjectionContext(input);
  return createInputSignal(REQUIRED_UNSET_VALUE, opts);
}
var input = (() => {
  inputFunction.required = inputRequiredFunction;
  return inputFunction;
})();
function viewChildFn(locator, opts) {
  ngDevMode && assertInInjectionContext(viewChild);
  return createSingleResultOptionalQuerySignalFn(opts);
}
function viewChildRequiredFn(locator, opts) {
  ngDevMode && assertInInjectionContext(viewChild);
  return createSingleResultRequiredQuerySignalFn(opts);
}
var viewChild = (() => {
  viewChildFn.required = viewChildRequiredFn;
  return viewChildFn;
})();
function viewChildren(locator, opts) {
  ngDevMode && assertInInjectionContext(viewChildren);
  return createMultiResultQuerySignalFn(opts);
}
function contentChildFn(locator, opts) {
  ngDevMode && assertInInjectionContext(contentChild);
  return createSingleResultOptionalQuerySignalFn(opts);
}
function contentChildRequiredFn(locator, opts) {
  ngDevMode && assertInInjectionContext(contentChildren);
  return createSingleResultRequiredQuerySignalFn(opts);
}
var contentChild = (() => {
  contentChildFn.required = contentChildRequiredFn;
  return contentChildFn;
})();
function contentChildren(locator, opts) {
  return createMultiResultQuerySignalFn(opts);
}
function createModelSignal(initialValue, opts) {
  const node = Object.create(INPUT_SIGNAL_NODE);
  const emitterRef = new OutputEmitterRef();
  node.value = initialValue;
  function getter() {
    producerAccessed(node);
    assertModelSet(node.value);
    return node.value;
  }
  getter[SIGNAL] = node;
  getter.asReadonly = signalAsReadonlyFn.bind(getter);
  getter.set = (newValue) => {
    if (!node.equal(node.value, newValue)) {
      signalSetFn(node, newValue);
      emitterRef.emit(newValue);
    }
  };
  getter.update = (updateFn) => {
    assertModelSet(node.value);
    getter.set(updateFn(node.value));
  };
  getter.subscribe = emitterRef.subscribe.bind(emitterRef);
  getter.destroyRef = emitterRef.destroyRef;
  if (ngDevMode) {
    getter.toString = () => `[Model Signal: ${getter()}]`;
    node.debugName = opts?.debugName;
  }
  return getter;
}
function assertModelSet(value) {
  if (value === REQUIRED_UNSET_VALUE) {
    throw new RuntimeError(952, ngDevMode && "Model is required but no value is available yet.");
  }
}
function modelFunction(initialValue, opts) {
  ngDevMode && assertInInjectionContext(model);
  return createModelSignal(initialValue, opts);
}
function modelRequiredFunction(opts) {
  ngDevMode && assertInInjectionContext(model);
  return createModelSignal(REQUIRED_UNSET_VALUE, opts);
}
var model = (() => {
  modelFunction.required = modelRequiredFunction;
  return modelFunction;
})();
var emitDistinctChangesOnlyDefaultValue = true;
var Query = class {
};
var ContentChildren = makePropDecorator("ContentChildren", (selector, opts = {}) => __spreadValues({
  selector,
  first: false,
  isViewQuery: false,
  descendants: false,
  emitDistinctChangesOnly: emitDistinctChangesOnlyDefaultValue
}, opts), Query);
var ContentChild = makePropDecorator("ContentChild", (selector, opts = {}) => __spreadValues({
  selector,
  first: true,
  isViewQuery: false,
  descendants: true
}, opts), Query);
var ViewChildren = makePropDecorator("ViewChildren", (selector, opts = {}) => __spreadValues({
  selector,
  first: false,
  isViewQuery: true,
  descendants: true,
  emitDistinctChangesOnly: emitDistinctChangesOnlyDefaultValue
}, opts), Query);
var ViewChild = makePropDecorator("ViewChild", (selector, opts) => __spreadValues({
  selector,
  first: true,
  isViewQuery: true,
  descendants: true
}, opts), Query);
function compileNgModuleFactory(injector, options, moduleType) {
  ngDevMode && assertNgModuleType(moduleType);
  const moduleFactory = new NgModuleFactory2(moduleType);
  if (true) {
    return Promise.resolve(moduleFactory);
  }
  const compilerOptions = injector.get(COMPILER_OPTIONS, []).concat(options);
  setJitOptions({
    defaultEncapsulation: _lastDefined(compilerOptions.map((opts) => opts.defaultEncapsulation)),
    preserveWhitespaces: _lastDefined(compilerOptions.map((opts) => opts.preserveWhitespaces))
  });
  if (isComponentResourceResolutionQueueEmpty()) {
    return Promise.resolve(moduleFactory);
  }
  const compilerProviders = compilerOptions.flatMap((option) => option.providers ?? []);
  if (compilerProviders.length === 0) {
    return Promise.resolve(moduleFactory);
  }
  const compiler = getCompilerFacade({
    usage: 0,
    kind: "NgModule",
    type: moduleType
  });
  const compilerInjector = Injector.create({
    providers: compilerProviders
  });
  const resourceLoader = compilerInjector.get(compiler.ResourceLoader);
  return resolveComponentResources((url) => Promise.resolve(resourceLoader.get(url))).then(() => moduleFactory);
}
function _lastDefined(args) {
  for (let i = args.length - 1; i >= 0; i--) {
    if (args[i] !== void 0) {
      return args[i];
    }
  }
  return void 0;
}
var NgZoneChangeDetectionScheduler = class _NgZoneChangeDetectionScheduler {
  zone = inject(NgZone);
  changeDetectionScheduler = inject(ChangeDetectionScheduler);
  applicationRef = inject(ApplicationRef);
  applicationErrorHandler = inject(INTERNAL_APPLICATION_ERROR_HANDLER);
  _onMicrotaskEmptySubscription;
  initialize() {
    if (this._onMicrotaskEmptySubscription) {
      return;
    }
    this._onMicrotaskEmptySubscription = this.zone.onMicrotaskEmpty.subscribe({
      next: () => {
        if (this.changeDetectionScheduler.runningTick) {
          return;
        }
        this.zone.run(() => {
          try {
            this.applicationRef.dirtyFlags |= 1;
            this.applicationRef._tick();
          } catch (e) {
            this.applicationErrorHandler(e);
          }
        });
      }
    });
  }
  ngOnDestroy() {
    this._onMicrotaskEmptySubscription?.unsubscribe();
  }
  static ɵfac = function NgZoneChangeDetectionScheduler_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NgZoneChangeDetectionScheduler)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NgZoneChangeDetectionScheduler,
    factory: _NgZoneChangeDetectionScheduler.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgZoneChangeDetectionScheduler, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var PROVIDED_NG_ZONE = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "provideZoneChangeDetection token" : "", {
  factory: () => false
});
function internalProvideZoneChangeDetection({
  ngZoneFactory,
  scheduleInRootZone
}) {
  ngZoneFactory ??= () => new NgZone(__spreadProps(__spreadValues({}, getNgZoneOptions()), {
    scheduleInRootZone
  }));
  return [{
    provide: ZONELESS_ENABLED,
    useValue: false
  }, {
    provide: NgZone,
    useFactory: ngZoneFactory
  }, {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useFactory: () => {
      const ngZoneChangeDetectionScheduler = inject(NgZoneChangeDetectionScheduler, {
        optional: true
      });
      if ((typeof ngDevMode === "undefined" || ngDevMode) && ngZoneChangeDetectionScheduler === null) {
        throw new RuntimeError(402, `A required Injectable was not found in the dependency injection tree. If you are bootstrapping an NgModule, make sure that the \`BrowserModule\` is imported.`);
      }
      return () => ngZoneChangeDetectionScheduler.initialize();
    }
  }, {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useFactory: () => {
      const service = inject(ZoneStablePendingTask);
      return () => {
        service.initialize();
      };
    }
  }, {
    provide: SCHEDULE_IN_ROOT_ZONE,
    useValue: scheduleInRootZone ?? SCHEDULE_IN_ROOT_ZONE_DEFAULT
  }];
}
function provideZoneChangeDetection(options) {
  const scheduleInRootZone = options?.scheduleInRootZone;
  const zoneProviders = internalProvideZoneChangeDetection({
    ngZoneFactory: () => {
      const ngZoneOptions = getNgZoneOptions(options);
      ngZoneOptions.scheduleInRootZone = scheduleInRootZone;
      if (ngZoneOptions.shouldCoalesceEventChangeDetection) {
        performanceMarkFeature("NgZone_CoalesceEvent");
      }
      return new NgZone(ngZoneOptions);
    },
    scheduleInRootZone
  });
  return makeEnvironmentProviders([{
    provide: PROVIDED_NG_ZONE,
    useValue: true
  }, zoneProviders]);
}
function getNgZoneOptions(options) {
  return {
    enableLongStackTrace: typeof ngDevMode === "undefined" ? false : !!ngDevMode,
    shouldCoalesceEventChangeDetection: options?.eventCoalescing ?? false,
    shouldCoalesceRunChangeDetection: options?.runCoalescing ?? false
  };
}
var ZoneStablePendingTask = class _ZoneStablePendingTask {
  subscription = new Subscription();
  initialized = false;
  zone = inject(NgZone);
  pendingTasks = inject(PendingTasksInternal);
  initialize() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    let task = null;
    if (!this.zone.isStable && !this.zone.hasPendingMacrotasks && !this.zone.hasPendingMicrotasks) {
      task = this.pendingTasks.add();
    }
    this.zone.runOutsideAngular(() => {
      this.subscription.add(this.zone.onStable.subscribe(() => {
        NgZone.assertNotInAngularZone();
        queueMicrotask(() => {
          if (task !== null && !this.zone.hasPendingMacrotasks && !this.zone.hasPendingMicrotasks) {
            this.pendingTasks.remove(task);
            task = null;
          }
        });
      }));
    });
    this.subscription.add(this.zone.onUnstable.subscribe(() => {
      NgZone.assertInAngularZone();
      task ??= this.pendingTasks.add();
    }));
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  static ɵfac = function ZoneStablePendingTask_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ZoneStablePendingTask)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ZoneStablePendingTask,
    factory: _ZoneStablePendingTask.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ZoneStablePendingTask, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var SCAN_DELAY = 200;
var OVERSIZED_IMAGE_TOLERANCE = 1200;
var ImagePerformanceWarning = class _ImagePerformanceWarning {
  window = null;
  observer = null;
  options = inject(IMAGE_CONFIG);
  lcpImageUrl;
  start() {
    if (typeof PerformanceObserver === "undefined" || this.options?.disableImageSizeWarning && this.options?.disableImageLazyLoadWarning) {
      return;
    }
    this.observer = this.initPerformanceObserver();
    const doc = getDocument();
    const win = doc.defaultView;
    if (win) {
      this.window = win;
      const waitToScan = () => {
        setTimeout(this.scanImages.bind(this), SCAN_DELAY);
      };
      const setup = () => {
        if (doc.readyState === "complete") {
          waitToScan();
        } else {
          this.window?.addEventListener("load", waitToScan, {
            once: true
          });
        }
      };
      if (typeof Zone !== "undefined") {
        Zone.root.run(() => setup());
      } else {
        setup();
      }
    }
  }
  ngOnDestroy() {
    this.observer?.disconnect();
  }
  initPerformanceObserver() {
    if (typeof PerformanceObserver === "undefined") {
      return null;
    }
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length === 0) return;
      const lcpElement = entries[entries.length - 1];
      const imgSrc = lcpElement.element?.src ?? "";
      if (imgSrc.startsWith("data:") || imgSrc.startsWith("blob:")) return;
      this.lcpImageUrl = imgSrc;
    });
    observer.observe({
      type: "largest-contentful-paint",
      buffered: true
    });
    return observer;
  }
  scanImages() {
    const images = getDocument().querySelectorAll("img");
    let lcpElementFound, lcpElementLoadedCorrectly = false;
    for (let index = 0; index < images.length; index++) {
      const image = images[index];
      if (!image) {
        continue;
      }
      if (!this.options?.disableImageSizeWarning) {
        if (!image.getAttribute("ng-img") && this.isOversized(image)) {
          logOversizedImageWarning(image.src);
        }
      }
      if (!this.options?.disableImageLazyLoadWarning && this.lcpImageUrl) {
        if (image.src === this.lcpImageUrl) {
          lcpElementFound = true;
          if (image.loading !== "lazy" || image.getAttribute("ng-img")) {
            lcpElementLoadedCorrectly = true;
          }
        }
      }
    }
    if (lcpElementFound && !lcpElementLoadedCorrectly && this.lcpImageUrl && !this.options?.disableImageLazyLoadWarning) {
      logLazyLCPWarning(this.lcpImageUrl);
    }
  }
  isOversized(image) {
    if (!this.window) {
      return false;
    }
    const nonOversizedImageExtentions = [".svg"];
    const imageSource = (image.src || "").toLowerCase();
    if (nonOversizedImageExtentions.some((extension) => imageSource.endsWith(extension))) {
      return false;
    }
    const computedStyle = this.window.getComputedStyle(image);
    let renderedWidth = parseFloat(computedStyle.getPropertyValue("width"));
    let renderedHeight = parseFloat(computedStyle.getPropertyValue("height"));
    const boxSizing = computedStyle.getPropertyValue("box-sizing");
    const objectFit = computedStyle.getPropertyValue("object-fit");
    if (objectFit === `cover`) {
      return false;
    }
    if (boxSizing === "border-box") {
      const paddingTop = computedStyle.getPropertyValue("padding-top");
      const paddingRight = computedStyle.getPropertyValue("padding-right");
      const paddingBottom = computedStyle.getPropertyValue("padding-bottom");
      const paddingLeft = computedStyle.getPropertyValue("padding-left");
      renderedWidth -= parseFloat(paddingRight) + parseFloat(paddingLeft);
      renderedHeight -= parseFloat(paddingTop) + parseFloat(paddingBottom);
    }
    const intrinsicWidth = image.naturalWidth;
    const intrinsicHeight = image.naturalHeight;
    const recommendedWidth = this.window.devicePixelRatio * renderedWidth;
    const recommendedHeight = this.window.devicePixelRatio * renderedHeight;
    const oversizedWidth = intrinsicWidth - recommendedWidth >= OVERSIZED_IMAGE_TOLERANCE;
    const oversizedHeight = intrinsicHeight - recommendedHeight >= OVERSIZED_IMAGE_TOLERANCE;
    return oversizedWidth || oversizedHeight;
  }
  static ɵfac = function ImagePerformanceWarning_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ImagePerformanceWarning)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ImagePerformanceWarning,
    factory: _ImagePerformanceWarning.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ImagePerformanceWarning, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
function logLazyLCPWarning(src) {
  console.warn(formatRuntimeError(-913, `An image with src ${src} is the Largest Contentful Paint (LCP) element but was given a "loading" value of "lazy", which can negatively impact application loading performance. This warning can be addressed by changing the loading value of the LCP image to "eager", or by using the NgOptimizedImage directive's prioritization utilities. For more information about addressing or disabling this warning, see ${ERROR_DETAILS_PAGE_BASE_URL}/NG0913`));
}
function logOversizedImageWarning(src) {
  console.warn(formatRuntimeError(-913, `An image with src ${src} has intrinsic file dimensions much larger than its rendered size. This can negatively impact application loading performance. For more information about addressing or disabling this warning, see ${ERROR_DETAILS_PAGE_BASE_URL}/NG0913`));
}
var PLATFORM_DESTROY_LISTENERS = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "PlatformDestroyListeners" : "");
var ENABLE_ROOT_COMPONENT_BOOTSTRAP = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "ENABLE_ROOT_COMPONENT_BOOTSTRAP" : "");
function isApplicationBootstrapConfig(config) {
  return !config.moduleRef;
}
function bootstrap(config) {
  const envInjector = isApplicationBootstrapConfig(config) ? config.r3Injector : config.moduleRef.injector;
  const ngZone = envInjector.get(NgZone);
  return ngZone.run(() => {
    if (isApplicationBootstrapConfig(config)) {
      config.r3Injector.resolveInjectorInitializers();
    } else {
      config.moduleRef.resolveInjectorInitializers();
    }
    const exceptionHandler = envInjector.get(INTERNAL_APPLICATION_ERROR_HANDLER);
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (envInjector.get(PROVIDED_ZONELESS) && envInjector.get(PROVIDED_NG_ZONE)) {
        console.warn(formatRuntimeError(408, "Both provideZoneChangeDetection and provideZonelessChangeDetection are provided. This is likely a mistake. Update the application providers to use only one of the two."));
      }
    }
    let onErrorSubscription;
    ngZone.runOutsideAngular(() => {
      onErrorSubscription = ngZone.onError.subscribe({
        next: exceptionHandler
      });
    });
    if (isApplicationBootstrapConfig(config)) {
      const destroyListener = () => envInjector.destroy();
      const onPlatformDestroyListeners = config.platformInjector.get(PLATFORM_DESTROY_LISTENERS);
      onPlatformDestroyListeners.add(destroyListener);
      envInjector.onDestroy(() => {
        onErrorSubscription.unsubscribe();
        onPlatformDestroyListeners.delete(destroyListener);
      });
    } else {
      const destroyListener = () => config.moduleRef.destroy();
      const onPlatformDestroyListeners = config.platformInjector.get(PLATFORM_DESTROY_LISTENERS);
      onPlatformDestroyListeners.add(destroyListener);
      config.moduleRef.onDestroy(() => {
        remove(config.allPlatformModules, config.moduleRef);
        onErrorSubscription.unsubscribe();
        onPlatformDestroyListeners.delete(destroyListener);
      });
    }
    return _callAndReportToErrorHandler(exceptionHandler, ngZone, () => {
      const pendingTasks = envInjector.get(PendingTasksInternal);
      const taskId = pendingTasks.add();
      const initStatus = envInjector.get(ApplicationInitStatus);
      initStatus.runInitializers();
      return initStatus.donePromise.then(() => {
        const localeId = envInjector.get(LOCALE_ID, DEFAULT_LOCALE_ID);
        setLocaleId(localeId || DEFAULT_LOCALE_ID);
        const enableRootComponentbootstrap = envInjector.get(ENABLE_ROOT_COMPONENT_BOOTSTRAP, true);
        if (!enableRootComponentbootstrap) {
          if (isApplicationBootstrapConfig(config)) {
            return envInjector.get(ApplicationRef);
          }
          config.allPlatformModules.push(config.moduleRef);
          return config.moduleRef;
        }
        if (typeof ngDevMode === "undefined" || ngDevMode) {
          const imagePerformanceService = envInjector.get(ImagePerformanceWarning);
          imagePerformanceService.start();
        }
        if (isApplicationBootstrapConfig(config)) {
          const appRef = envInjector.get(ApplicationRef);
          if (config.rootComponent !== void 0) {
            appRef.bootstrap(config.rootComponent);
          }
          return appRef;
        } else {
          moduleBootstrapImpl?.(config.moduleRef, config.allPlatformModules);
          return config.moduleRef;
        }
      }).finally(() => void pendingTasks.remove(taskId));
    });
  });
}
var moduleBootstrapImpl;
function setModuleBootstrapImpl() {
  moduleBootstrapImpl = _moduleDoBootstrap;
}
function _moduleDoBootstrap(moduleRef, allPlatformModules) {
  const appRef = moduleRef.injector.get(ApplicationRef);
  if (moduleRef._bootstrapComponents.length > 0) {
    moduleRef._bootstrapComponents.forEach((f) => appRef.bootstrap(f));
  } else if (moduleRef.instance.ngDoBootstrap) {
    moduleRef.instance.ngDoBootstrap(appRef);
  } else {
    throw new RuntimeError(-403, ngDevMode && `The module ${stringify(moduleRef.instance.constructor)} was bootstrapped, but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. Please define one of these.`);
  }
  allPlatformModules.push(moduleRef);
}
function _callAndReportToErrorHandler(errorHandler, ngZone, callback) {
  try {
    const result = callback();
    if (isPromise(result)) {
      return result.catch((e) => {
        ngZone.runOutsideAngular(() => errorHandler(e));
        throw e;
      });
    }
    return result;
  } catch (e) {
    ngZone.runOutsideAngular(() => errorHandler(e));
    throw e;
  }
}
var PlatformRef = class _PlatformRef {
  _injector;
  _modules = [];
  _destroyListeners = [];
  _destroyed = false;
  constructor(_injector) {
    this._injector = _injector;
  }
  bootstrapModuleFactory(moduleFactory, options) {
    const allAppProviders = [provideZonelessChangeDetectionInternal(), ...options?.applicationProviders ?? [], errorHandlerEnvironmentInitializer, ...ngDevMode ? [validAppIdInitializer] : []];
    const moduleRef = createNgModuleRefWithProviders(moduleFactory.moduleType, this.injector, allAppProviders);
    setModuleBootstrapImpl();
    return bootstrap({
      moduleRef,
      allPlatformModules: this._modules,
      platformInjector: this.injector
    });
  }
  bootstrapModule(moduleType, compilerOptions = []) {
    const options = optionsReducer({}, compilerOptions);
    setModuleBootstrapImpl();
    return compileNgModuleFactory(this.injector, options, moduleType).then((moduleFactory) => this.bootstrapModuleFactory(moduleFactory, options));
  }
  onDestroy(callback) {
    this._destroyListeners.push(callback);
  }
  get injector() {
    return this._injector;
  }
  destroy() {
    if (this._destroyed) {
      throw new RuntimeError(404, ngDevMode && "The platform has already been destroyed!");
    }
    this._modules.slice().forEach((module) => module.destroy());
    this._destroyListeners.forEach((listener) => listener());
    const destroyListeners = this._injector.get(PLATFORM_DESTROY_LISTENERS, null);
    if (destroyListeners) {
      destroyListeners.forEach((listener) => listener());
      destroyListeners.clear();
    }
    this._destroyed = true;
  }
  get destroyed() {
    return this._destroyed;
  }
  static ɵfac = function PlatformRef_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _PlatformRef)(ɵɵinject(Injector));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _PlatformRef,
    factory: _PlatformRef.ɵfac,
    providedIn: "platform"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PlatformRef, [{
    type: Injectable,
    args: [{
      providedIn: "platform"
    }]
  }], () => [{
    type: Injector
  }], null);
})();
var _platformInjector = null;
function createPlatform(injector) {
  if (getPlatform()) {
    throw new RuntimeError(400, ngDevMode && "There can be only one platform. Destroy the previous one to create a new one.");
  }
  publishDefaultGlobalUtils();
  publishSignalConfiguration();
  _platformInjector = true ? injector : null;
  const platform = injector.get(PlatformRef);
  runPlatformInitializers(injector);
  return platform;
}
function createPlatformFactory(parentPlatformFactory, name, providers = []) {
  const desc = `Platform: ${name}`;
  const marker = new InjectionToken(desc);
  return (extraProviders = []) => {
    let platform = getPlatform();
    if (!platform) {
      const platformProviders = [...providers, ...extraProviders, {
        provide: marker,
        useValue: true
      }];
      platform = parentPlatformFactory?.(platformProviders) ?? createPlatform(createPlatformInjector(platformProviders, desc));
    }
    return false ? platform : assertPlatform(marker);
  };
}
function createPlatformInjector(providers = [], name) {
  return Injector.create({
    name,
    providers: [{
      provide: INJECTOR_SCOPE,
      useValue: "platform"
    }, {
      provide: PLATFORM_DESTROY_LISTENERS,
      useValue: /* @__PURE__ */ new Set([() => _platformInjector = null])
    }, ...providers]
  });
}
function assertPlatform(requiredToken) {
  const platform = getPlatform();
  if (!platform) {
    throw new RuntimeError(-401, ngDevMode && "No platform exists!");
  }
  if ((typeof ngDevMode === "undefined" || ngDevMode) && !platform.injector.get(requiredToken, null)) {
    throw new RuntimeError(400, "A platform with a different configuration has been created. Please destroy it first.");
  }
  return platform;
}
function getPlatform() {
  if (false) {
    return null;
  }
  return _platformInjector?.get(PlatformRef) ?? null;
}
function destroyPlatform() {
  getPlatform()?.destroy();
}
function createOrReusePlatformInjector(providers = []) {
  if (_platformInjector) return _platformInjector;
  publishDefaultGlobalUtils();
  const injector = createPlatformInjector(providers);
  if (true) {
    _platformInjector = injector;
  }
  publishSignalConfiguration();
  runPlatformInitializers(injector);
  return injector;
}
function providePlatformInitializer(initializerFn) {
  return {
    provide: PLATFORM_INITIALIZER,
    useValue: initializerFn,
    multi: true
  };
}
function runPlatformInitializers(injector) {
  const inits = injector.get(PLATFORM_INITIALIZER, null);
  runInInjectionContext(injector, () => {
    inits?.forEach((init) => init());
  });
}
function exhaustiveCheckNoChangesInterval(interval) {
  return provideEnvironmentInitializer(() => {
    const applicationRef = inject(ApplicationRef);
    const errorHandler = inject(ErrorHandler);
    const scheduler = inject(ChangeDetectionSchedulerImpl);
    const ngZone = inject(NgZone);
    function scheduleCheckNoChanges() {
      ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          if (applicationRef.destroyed) {
            return;
          }
          if (scheduler.pendingRenderTaskId || scheduler.runningTick) {
            scheduleCheckNoChanges();
            return;
          }
          for (const view of applicationRef.allViews) {
            try {
              checkNoChangesInternal(view._lView, true);
            } catch (e) {
              errorHandler.handleError(e);
            }
          }
          scheduleCheckNoChanges();
        }, interval);
      });
    }
    scheduleCheckNoChanges();
  });
}
function provideCheckNoChangesConfig(options) {
  return makeEnvironmentProviders(typeof ngDevMode === "undefined" || ngDevMode ? [{
    provide: UseExhaustiveCheckNoChanges,
    useValue: options.exhaustive
  }, options?.interval !== void 0 ? exhaustiveCheckNoChangesInterval(options.interval) : []] : []);
}
function isDevMode() {
  return typeof ngDevMode === "undefined" || !!ngDevMode;
}
function enableProdMode() {
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    _global["ngDevMode"] = false;
  }
}
var appsWithEventReplay = /* @__PURE__ */ new WeakSet();
var EAGER_CONTENT_LISTENERS_KEY = "";
function shouldEnableEventReplay(injector) {
  return injector.get(IS_EVENT_REPLAY_ENABLED, EVENT_REPLAY_ENABLED_DEFAULT);
}
function withEventReplay() {
  const providers = [{
    provide: IS_EVENT_REPLAY_ENABLED,
    useFactory: () => {
      let isEnabled = true;
      if (true) {
        const appId = inject(APP_ID);
        isEnabled = !!window._ejsas?.[appId];
      }
      if (isEnabled) {
        performanceMarkFeature("NgEventReplay");
      }
      return isEnabled;
    }
  }];
  if (true) {
    providers.push({
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        const appRef = inject(ApplicationRef);
        const {
          injector
        } = appRef;
        if (!appsWithEventReplay.has(appRef)) {
          const jsActionMap = inject(JSACTION_BLOCK_ELEMENT_MAP);
          if (shouldEnableEventReplay(injector)) {
            enableStashEventListenerImpl();
            const appId = injector.get(APP_ID);
            const clearStashFn = setStashFn(appId, (rEl, eventName, listenerFn) => {
              if (rEl.nodeType !== Node.ELEMENT_NODE) return;
              sharedStashFunction(rEl, eventName, listenerFn);
              sharedMapFunction(rEl, jsActionMap);
            });
            appRef.onDestroy(clearStashFn);
          }
        }
      },
      multi: true
    }, {
      provide: APP_BOOTSTRAP_LISTENER,
      useFactory: () => {
        const appRef = inject(ApplicationRef);
        const {
          injector
        } = appRef;
        return () => {
          if (!shouldEnableEventReplay(injector) || appsWithEventReplay.has(appRef)) {
            return;
          }
          appsWithEventReplay.add(appRef);
          const appId = injector.get(APP_ID);
          appRef.onDestroy(() => {
            appsWithEventReplay.delete(appRef);
            if (true) {
              clearAppScopedEarlyEventContract(appId);
            }
          });
          appRef.whenStable().then(() => {
            if (appRef.destroyed) {
              return;
            }
            const eventContractDetails = injector.get(JSACTION_EVENT_CONTRACT);
            initEventReplay(eventContractDetails, injector);
            const jsActionMap = injector.get(JSACTION_BLOCK_ELEMENT_MAP);
            jsActionMap.get(EAGER_CONTENT_LISTENERS_KEY)?.forEach(removeListeners);
            jsActionMap.delete(EAGER_CONTENT_LISTENERS_KEY);
            const eventContract = eventContractDetails.instance;
            if (isIncrementalHydrationEnabled(injector)) {
              appRef.onDestroy(() => eventContract.cleanUp());
            } else {
              eventContract.cleanUp();
            }
          });
        };
      },
      multi: true
    });
  }
  return providers;
}
var initEventReplay = (eventDelegation, injector) => {
  const appId = injector.get(APP_ID);
  const earlyJsactionData = window._ejsas[appId];
  const eventContract = eventDelegation.instance = new EventContract(new EventContractContainer(earlyJsactionData.c));
  for (const et of earlyJsactionData.et) {
    eventContract.addEvent(et);
  }
  for (const et of earlyJsactionData.etc) {
    eventContract.addEvent(et);
  }
  const eventInfos = getAppScopedQueuedEventInfos(appId);
  eventContract.replayEarlyEventInfos(eventInfos);
  clearAppScopedEarlyEventContract(appId);
  const dispatcher = new EventDispatcher((event) => {
    invokeRegisteredReplayListeners(injector, event, event.currentTarget);
  });
  registerDispatcher$1(eventContract, dispatcher);
};
function collectDomEventsInfo(tView, lView, eventTypesToReplay) {
  const domEventsInfo = /* @__PURE__ */ new Map();
  const lCleanup = lView[CLEANUP];
  const tCleanup = tView.cleanup;
  if (!tCleanup || !lCleanup) {
    return domEventsInfo;
  }
  for (let i = 0; i < tCleanup.length; ) {
    const firstParam = tCleanup[i++];
    const secondParam = tCleanup[i++];
    if (typeof firstParam !== "string") {
      continue;
    }
    const eventType = firstParam;
    if (!isEarlyEventType(eventType)) {
      continue;
    }
    if (isCaptureEventType(eventType)) {
      eventTypesToReplay.capture.add(eventType);
    } else {
      eventTypesToReplay.regular.add(eventType);
    }
    const listenerElement = unwrapRNode(lView[secondParam]);
    i++;
    const useCaptureOrIndx = tCleanup[i++];
    const isDomEvent = typeof useCaptureOrIndx === "boolean" || useCaptureOrIndx >= 0;
    if (!isDomEvent) {
      continue;
    }
    if (!domEventsInfo.has(listenerElement)) {
      domEventsInfo.set(listenerElement, [eventType]);
    } else {
      domEventsInfo.get(listenerElement).push(eventType);
    }
  }
  return domEventsInfo;
}
function invokeRegisteredReplayListeners(injector, event, currentTarget) {
  const blockName = (currentTarget && currentTarget.getAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE)) ?? "";
  if (/d\d+/.test(blockName)) {
    hydrateAndInvokeBlockListeners(blockName, injector, event, currentTarget);
  } else if (event.eventPhase === EventPhase.REPLAY) {
    invokeListeners(event, currentTarget);
  }
}
function hydrateAndInvokeBlockListeners(blockName, injector, event, currentTarget) {
  const queue = injector.get(EVENT_REPLAY_QUEUE);
  queue.push({
    event,
    currentTarget
  });
  triggerHydrationFromBlockName(injector, blockName, createReplayQueuedBlockEventsFn(queue));
}
function createReplayQueuedBlockEventsFn(queue) {
  return (hydratedBlocks) => {
    const hydrated = new Set(hydratedBlocks);
    const newQueue = [];
    for (let {
      event,
      currentTarget
    } of queue) {
      const blockName = currentTarget.getAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE);
      if (hydrated.has(blockName)) {
        invokeListeners(event, currentTarget);
      } else {
        newQueue.push({
          event,
          currentTarget
        });
      }
    }
    queue.length = 0;
    queue.push(...newQueue);
  };
}
var isHydrationSupportEnabled = false;
var isI18nHydrationRuntimeSupportEnabled = false;
var isIncrementalHydrationRuntimeSupportEnabled = false;
var APPLICATION_IS_STABLE_TIMEOUT = 1e4;
function enableHydrationRuntimeSupport() {
  if (!isHydrationSupportEnabled) {
    isHydrationSupportEnabled = true;
    enableRetrieveHydrationInfoImpl();
    enableLocateOrCreateElementNodeImpl();
    enableLocateOrCreateTextNodeImpl();
    enableLocateOrCreateElementContainerNodeImpl();
    enableLocateOrCreateContainerAnchorImpl();
    enableLocateOrCreateContainerRefImpl();
    enableFindMatchingDehydratedViewImpl();
    enableApplyRootElementTransformImpl();
  }
}
function enableI18nHydrationRuntimeSupport() {
  if (!isI18nHydrationRuntimeSupportEnabled) {
    isI18nHydrationRuntimeSupportEnabled = true;
    enableLocateOrCreateI18nNodeImpl();
    enablePrepareI18nBlockForHydrationImpl();
    enableClaimDehydratedIcuCaseImpl();
  }
}
function enableIncrementalHydrationRuntimeSupport() {
  if (!isIncrementalHydrationRuntimeSupportEnabled) {
    isIncrementalHydrationRuntimeSupportEnabled = true;
    enableRetrieveDeferBlockDataImpl();
  }
}
function printHydrationStats(injector) {
  const console2 = injector.get(Console);
  const message = `Angular hydrated ${ngDevMode.hydratedComponents} component(s) and ${ngDevMode.hydratedNodes} node(s), ${ngDevMode.componentsSkippedHydration} component(s) were skipped. ` + (isIncrementalHydrationEnabled(injector) ? `${ngDevMode.deferBlocksWithIncrementalHydration} defer block(s) were configured to use incremental hydration. ` : "") + `Learn more at ${DOC_PAGE_BASE_URL}/guide/hydration.`;
  console2.log(message);
}
function whenStableWithTimeout(appRef) {
  const whenStablePromise = appRef.whenStable();
  if (typeof ngDevMode !== "undefined" && ngDevMode) {
    const timeoutTime = APPLICATION_IS_STABLE_TIMEOUT;
    const console2 = appRef.injector.get(Console);
    const ngZone = appRef.injector.get(NgZone);
    const timeoutId = ngZone.runOutsideAngular(() => {
      return setTimeout(() => logWarningOnStableTimedout(timeoutTime, console2), timeoutTime);
    });
    whenStablePromise.finally(() => clearTimeout(timeoutId));
  }
  return whenStablePromise;
}
var CLIENT_RENDER_MODE_FLAG = "ngcm";
function isClientRenderModeEnabled(doc) {
  return doc.body.hasAttribute(CLIENT_RENDER_MODE_FLAG);
}
function withDomHydration() {
  const providers = [{
    provide: IS_HYDRATION_DOM_REUSE_ENABLED,
    useFactory: () => {
      let isEnabled = true;
      if (true) {
        const transferState = inject(TransferState, {
          optional: true
        });
        isEnabled = !!transferState?.get(NGH_DATA_KEY, null);
      }
      if (isEnabled) {
        performanceMarkFeature("NgHydration");
      }
      return isEnabled;
    }
  }, {
    provide: ENVIRONMENT_INITIALIZER,
    useValue: () => {
      setIsI18nHydrationSupportEnabled(false);
      if (false) {
        return;
      }
      const doc = inject(DOCUMENT);
      if (inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
        verifySsrContentsIntegrity(doc);
        enableHydrationRuntimeSupport();
      } else if (typeof ngDevMode !== "undefined" && ngDevMode && !isClientRenderModeEnabled(doc)) {
        const console2 = inject(Console);
        const message = formatRuntimeError(-505, "Angular hydration was requested on the client, but there was no serialized information present in the server response, thus hydration was not enabled. Make sure the `provideClientHydration()` is included into the list of providers in the server part of the application configuration.");
        console2.warn(message);
      }
    },
    multi: true
  }];
  if (true) {
    providers.push({
      provide: PRESERVE_HOST_CONTENT,
      useFactory: () => {
        return inject(IS_HYDRATION_DOM_REUSE_ENABLED);
      }
    }, {
      provide: APP_BOOTSTRAP_LISTENER,
      useFactory: () => {
        if (inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
          const appRef = inject(ApplicationRef);
          return () => {
            whenStableWithTimeout(appRef).then(() => {
              if (appRef.destroyed) {
                return;
              }
              cleanupDehydratedViews(appRef);
              if (typeof ngDevMode !== "undefined" && ngDevMode) {
                countBlocksSkippedByHydration(appRef.injector);
                printHydrationStats(appRef.injector);
              }
            });
          };
        }
        return () => {
        };
      },
      multi: true
    });
  }
  return makeEnvironmentProviders(providers);
}
function withI18nSupport() {
  return [{
    provide: IS_I18N_HYDRATION_ENABLED,
    useFactory: () => inject(IS_HYDRATION_DOM_REUSE_ENABLED)
  }, {
    provide: ENVIRONMENT_INITIALIZER,
    useValue: () => {
      if (inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
        enableI18nHydrationRuntimeSupport();
        setIsI18nHydrationSupportEnabled(true);
        performanceMarkFeature("NgI18nHydration");
      }
    },
    multi: true
  }];
}
function withIncrementalHydration() {
  const providers = [withEventReplay(), {
    provide: IS_INCREMENTAL_HYDRATION_ENABLED,
    useValue: true
  }, {
    provide: DEHYDRATED_BLOCK_REGISTRY,
    useClass: DehydratedBlockRegistry
  }, {
    provide: ENVIRONMENT_INITIALIZER,
    useValue: () => {
      enableIncrementalHydrationRuntimeSupport();
      performanceMarkFeature("NgIncrementalHydration");
    },
    multi: true
  }];
  if (true) {
    providers.push({
      provide: APP_BOOTSTRAP_LISTENER,
      useFactory: () => {
        const injector = inject(Injector);
        const doc = inject(DOCUMENT);
        return () => {
          const deferBlockData = processBlockData(injector);
          const commentsByBlockId = gatherDeferBlocksCommentNodes(doc, doc.body);
          processAndInitTriggers(injector, deferBlockData, commentsByBlockId);
          appendDeferBlocksToJSActionMap(doc, injector);
        };
      },
      multi: true
    });
  }
  return providers;
}
function logWarningOnStableTimedout(time, console2) {
  const message = `Angular hydration expected the ApplicationRef.isStable() to emit \`true\`, but it didn't happen within ${time}ms. Angular hydration logic depends on the application becoming stable as a signal to complete hydration process.`;
  console2.warn(formatRuntimeError(-506, message));
}
var STABILITY_WARNING_THRESHOLD = APPLICATION_IS_STABLE_TIMEOUT - 1e3;
var DebugTaskTrackerImpl = class {
  openTasks = /* @__PURE__ */ new Map();
  add(taskId) {
    this.openTasks.set(taskId, new Error("Task stack tracking error"));
  }
  remove(taskId) {
    this.openTasks.delete(taskId);
  }
};
function provideStabilityDebugging() {
  const taskTracker = new DebugTaskTrackerImpl();
  const {
    openTasks
  } = taskTracker;
  return makeEnvironmentProviders([{
    provide: DEBUG_TASK_TRACKER,
    useValue: taskTracker
  }, provideAppInitializer(() => {
    if (typeof ngDevMode === "undefined" || !ngDevMode) {
      console.warn("Stability debugging utility was provided in production mode. This will cause debug code to be included in production bundles. If this is intentional because you are debugging stability issues in a production environment, you can ignore this warning.");
    }
    const ngZone = inject(NgZone);
    const applicationRef = inject(ApplicationRef);
    let _taskTrackingZone = null;
    if (typeof Zone !== "undefined") {
      ngZone.run(() => {
        _taskTrackingZone = Zone.current.get("TaskTrackingZone");
      });
    }
    ngZone.runOutsideAngular(() => {
      const timeoutId = setTimeout(() => {
        console.debug(`---- Application did not stabilize within ${STABILITY_WARNING_THRESHOLD / 1e3} seconds ----`);
        if (typeof Zone !== "undefined" && !_taskTrackingZone) {
          console.info('Zone.js is present but no TaskTrackingZone found. To enable better debugging of tasks in the Angular Zone, import "zone.js/plugins/task-tracking" in your application.');
        }
        if (_taskTrackingZone?.macroTasks?.length) {
          console.group("Macrotasks keeping Angular Zone unstable:");
          for (const t of _taskTrackingZone?.macroTasks ?? []) {
            console.debug(t.creationLocation.stack);
          }
          console.groupEnd();
        }
        console.group("PendingTasks keeping application unstable:");
        for (const error of openTasks.values()) {
          console.debug(error.stack);
        }
        console.groupEnd();
      }, STABILITY_WARNING_THRESHOLD);
      applicationRef.whenStable().then(() => {
        clearTimeout(timeoutId);
      });
    });
  })]);
}
function getModuleFactory(id) {
  const type = getRegisteredNgModuleType(id);
  if (!type) throw noModuleError(id);
  return new NgModuleFactory2(type);
}
function getNgModuleById(id) {
  const type = getRegisteredNgModuleType(id);
  if (!type) throw noModuleError(id);
  return type;
}
function noModuleError(id) {
  return new RuntimeError(920, ngDevMode && `No module with ID ${id} loaded`);
}
var ChangeDetectorRef = class {
  static __NG_ELEMENT_ID__ = injectChangeDetectorRef;
};
function injectChangeDetectorRef(flags) {
  return createViewRef(getCurrentTNode(), getLView(), (flags & 16) === 16);
}
function createViewRef(tNode, lView, isPipe2) {
  if (isComponentHost(tNode) && !isPipe2) {
    const componentView = getComponentLViewByIndex(tNode.index, lView);
    return new ViewRef(componentView, componentView);
  } else if (tNode.type & (3 | 12 | 32 | 128)) {
    const hostComponentView = lView[DECLARATION_COMPONENT_VIEW];
    return new ViewRef(hostComponentView, lView);
  }
  return null;
}
var ViewRef2 = class extends ChangeDetectorRef {
};
var EmbeddedViewRef = class extends ViewRef2 {
};
var DefaultIterableDifferFactory = class {
  supports(obj) {
    return isListLikeIterable(obj);
  }
  create(trackByFn) {
    return new DefaultIterableDiffer(trackByFn);
  }
};
var trackByIdentity = (index, item) => item;
var DefaultIterableDiffer = class {
  length = 0;
  collection;
  _linkedRecords = null;
  _unlinkedRecords = null;
  _previousItHead = null;
  _itHead = null;
  _itTail = null;
  _additionsHead = null;
  _additionsTail = null;
  _movesHead = null;
  _movesTail = null;
  _removalsHead = null;
  _removalsTail = null;
  _identityChangesHead = null;
  _identityChangesTail = null;
  _trackByFn;
  constructor(trackByFn) {
    this._trackByFn = trackByFn || trackByIdentity;
  }
  forEachItem(fn) {
    let record;
    for (record = this._itHead; record !== null; record = record._next) {
      fn(record);
    }
  }
  forEachOperation(fn) {
    let nextIt = this._itHead;
    let nextRemove = this._removalsHead;
    let addRemoveOffset = 0;
    let moveOffsets = null;
    while (nextIt || nextRemove) {
      const record = !nextRemove || nextIt && nextIt.currentIndex < getPreviousIndex(nextRemove, addRemoveOffset, moveOffsets) ? nextIt : nextRemove;
      const adjPreviousIndex = getPreviousIndex(record, addRemoveOffset, moveOffsets);
      const currentIndex = record.currentIndex;
      if (record === nextRemove) {
        addRemoveOffset--;
        nextRemove = nextRemove._nextRemoved;
      } else {
        nextIt = nextIt._next;
        if (record.previousIndex == null) {
          addRemoveOffset++;
        } else {
          if (!moveOffsets) moveOffsets = [];
          const localMovePreviousIndex = adjPreviousIndex - addRemoveOffset;
          const localCurrentIndex = currentIndex - addRemoveOffset;
          if (localMovePreviousIndex != localCurrentIndex) {
            for (let i = 0; i < localMovePreviousIndex; i++) {
              const offset = i < moveOffsets.length ? moveOffsets[i] : moveOffsets[i] = 0;
              const index = offset + i;
              if (localCurrentIndex <= index && index < localMovePreviousIndex) {
                moveOffsets[i] = offset + 1;
              }
            }
            const previousIndex = record.previousIndex;
            moveOffsets[previousIndex] = localCurrentIndex - localMovePreviousIndex;
          }
        }
      }
      if (adjPreviousIndex !== currentIndex) {
        fn(record, adjPreviousIndex, currentIndex);
      }
    }
  }
  forEachPreviousItem(fn) {
    let record;
    for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
      fn(record);
    }
  }
  forEachAddedItem(fn) {
    let record;
    for (record = this._additionsHead; record !== null; record = record._nextAdded) {
      fn(record);
    }
  }
  forEachMovedItem(fn) {
    let record;
    for (record = this._movesHead; record !== null; record = record._nextMoved) {
      fn(record);
    }
  }
  forEachRemovedItem(fn) {
    let record;
    for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
      fn(record);
    }
  }
  forEachIdentityChange(fn) {
    let record;
    for (record = this._identityChangesHead; record !== null; record = record._nextIdentityChange) {
      fn(record);
    }
  }
  diff(collection) {
    if (collection == null) collection = [];
    if (!isListLikeIterable(collection)) {
      throw new RuntimeError(900, ngDevMode && `Error trying to diff '${stringify(collection)}'. Only arrays and iterables are allowed`);
    }
    if (this.check(collection)) {
      return this;
    } else {
      return null;
    }
  }
  onDestroy() {
  }
  check(collection) {
    this._reset();
    let record = this._itHead;
    let mayBeDirty = false;
    let index;
    let item;
    let itemTrackBy;
    if (Array.isArray(collection)) {
      this.length = collection.length;
      for (let index2 = 0; index2 < this.length; index2++) {
        item = collection[index2];
        itemTrackBy = this._trackByFn(index2, item);
        if (record === null || !Object.is(record.trackById, itemTrackBy)) {
          record = this._mismatch(record, item, itemTrackBy, index2);
          mayBeDirty = true;
        } else {
          if (mayBeDirty) {
            record = this._verifyReinsertion(record, item, itemTrackBy, index2);
          }
          if (!Object.is(record.item, item)) this._addIdentityChange(record, item);
        }
        record = record._next;
      }
    } else {
      index = 0;
      iterateListLike(collection, (item2) => {
        itemTrackBy = this._trackByFn(index, item2);
        if (record === null || !Object.is(record.trackById, itemTrackBy)) {
          record = this._mismatch(record, item2, itemTrackBy, index);
          mayBeDirty = true;
        } else {
          if (mayBeDirty) {
            record = this._verifyReinsertion(record, item2, itemTrackBy, index);
          }
          if (!Object.is(record.item, item2)) this._addIdentityChange(record, item2);
        }
        record = record._next;
        index++;
      });
      this.length = index;
    }
    this._truncate(record);
    this.collection = collection;
    return this.isDirty;
  }
  get isDirty() {
    return this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null || this._identityChangesHead !== null;
  }
  _reset() {
    if (this.isDirty) {
      let record;
      for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
        record._nextPrevious = record._next;
      }
      for (record = this._additionsHead; record !== null; record = record._nextAdded) {
        record.previousIndex = record.currentIndex;
      }
      this._additionsHead = this._additionsTail = null;
      for (record = this._movesHead; record !== null; record = record._nextMoved) {
        record.previousIndex = record.currentIndex;
      }
      this._movesHead = this._movesTail = null;
      this._removalsHead = this._removalsTail = null;
      this._identityChangesHead = this._identityChangesTail = null;
    }
  }
  _mismatch(record, item, itemTrackBy, index) {
    let previousRecord;
    if (record === null) {
      previousRecord = this._itTail;
    } else {
      previousRecord = record._prev;
      this._remove(record);
    }
    record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy, null);
    if (record !== null) {
      if (!Object.is(record.item, item)) this._addIdentityChange(record, item);
      this._reinsertAfter(record, previousRecord, index);
    } else {
      record = this._linkedRecords === null ? null : this._linkedRecords.get(itemTrackBy, index);
      if (record !== null) {
        if (!Object.is(record.item, item)) this._addIdentityChange(record, item);
        this._moveAfter(record, previousRecord, index);
      } else {
        record = this._addAfter(new IterableChangeRecord_(item, itemTrackBy), previousRecord, index);
      }
    }
    return record;
  }
  _verifyReinsertion(record, item, itemTrackBy, index) {
    let reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy, null);
    if (reinsertRecord !== null) {
      record = this._reinsertAfter(reinsertRecord, record._prev, index);
    } else if (record.currentIndex != index) {
      record.currentIndex = index;
      this._addToMoves(record, index);
    }
    return record;
  }
  _truncate(record) {
    while (record !== null) {
      const nextRecord = record._next;
      this._addToRemovals(this._unlink(record));
      record = nextRecord;
    }
    if (this._unlinkedRecords !== null) {
      this._unlinkedRecords.clear();
    }
    if (this._additionsTail !== null) {
      this._additionsTail._nextAdded = null;
    }
    if (this._movesTail !== null) {
      this._movesTail._nextMoved = null;
    }
    if (this._itTail !== null) {
      this._itTail._next = null;
    }
    if (this._removalsTail !== null) {
      this._removalsTail._nextRemoved = null;
    }
    if (this._identityChangesTail !== null) {
      this._identityChangesTail._nextIdentityChange = null;
    }
  }
  _reinsertAfter(record, prevRecord, index) {
    if (this._unlinkedRecords !== null) {
      this._unlinkedRecords.remove(record);
    }
    const prev = record._prevRemoved;
    const next = record._nextRemoved;
    if (prev === null) {
      this._removalsHead = next;
    } else {
      prev._nextRemoved = next;
    }
    if (next === null) {
      this._removalsTail = prev;
    } else {
      next._prevRemoved = prev;
    }
    this._insertAfter(record, prevRecord, index);
    this._addToMoves(record, index);
    return record;
  }
  _moveAfter(record, prevRecord, index) {
    this._unlink(record);
    this._insertAfter(record, prevRecord, index);
    this._addToMoves(record, index);
    return record;
  }
  _addAfter(record, prevRecord, index) {
    this._insertAfter(record, prevRecord, index);
    if (this._additionsTail === null) {
      this._additionsTail = this._additionsHead = record;
    } else {
      this._additionsTail = this._additionsTail._nextAdded = record;
    }
    return record;
  }
  _insertAfter(record, prevRecord, index) {
    const next = prevRecord === null ? this._itHead : prevRecord._next;
    record._next = next;
    record._prev = prevRecord;
    if (next === null) {
      this._itTail = record;
    } else {
      next._prev = record;
    }
    if (prevRecord === null) {
      this._itHead = record;
    } else {
      prevRecord._next = record;
    }
    if (this._linkedRecords === null) {
      this._linkedRecords = new _DuplicateMap();
    }
    this._linkedRecords.put(record);
    record.currentIndex = index;
    return record;
  }
  _remove(record) {
    return this._addToRemovals(this._unlink(record));
  }
  _unlink(record) {
    if (this._linkedRecords !== null) {
      this._linkedRecords.remove(record);
    }
    const prev = record._prev;
    const next = record._next;
    if (prev === null) {
      this._itHead = next;
    } else {
      prev._next = next;
    }
    if (next === null) {
      this._itTail = prev;
    } else {
      next._prev = prev;
    }
    return record;
  }
  _addToMoves(record, toIndex) {
    if (record.previousIndex === toIndex) {
      return record;
    }
    if (this._movesTail === null) {
      this._movesTail = this._movesHead = record;
    } else {
      this._movesTail = this._movesTail._nextMoved = record;
    }
    return record;
  }
  _addToRemovals(record) {
    if (this._unlinkedRecords === null) {
      this._unlinkedRecords = new _DuplicateMap();
    }
    this._unlinkedRecords.put(record);
    record.currentIndex = null;
    record._nextRemoved = null;
    if (this._removalsTail === null) {
      this._removalsTail = this._removalsHead = record;
      record._prevRemoved = null;
    } else {
      record._prevRemoved = this._removalsTail;
      this._removalsTail = this._removalsTail._nextRemoved = record;
    }
    return record;
  }
  _addIdentityChange(record, item) {
    record.item = item;
    if (this._identityChangesTail === null) {
      this._identityChangesTail = this._identityChangesHead = record;
    } else {
      this._identityChangesTail = this._identityChangesTail._nextIdentityChange = record;
    }
    return record;
  }
};
var IterableChangeRecord_ = class {
  item;
  trackById;
  currentIndex = null;
  previousIndex = null;
  _nextPrevious = null;
  _prev = null;
  _next = null;
  _prevDup = null;
  _nextDup = null;
  _prevRemoved = null;
  _nextRemoved = null;
  _nextAdded = null;
  _nextMoved = null;
  _nextIdentityChange = null;
  constructor(item, trackById) {
    this.item = item;
    this.trackById = trackById;
  }
};
var _DuplicateItemRecordList = class {
  _head = null;
  _tail = null;
  add(record) {
    if (this._head === null) {
      this._head = this._tail = record;
      record._nextDup = null;
      record._prevDup = null;
    } else {
      this._tail._nextDup = record;
      record._prevDup = this._tail;
      record._nextDup = null;
      this._tail = record;
    }
  }
  get(trackById, atOrAfterIndex) {
    let record;
    for (record = this._head; record !== null; record = record._nextDup) {
      if ((atOrAfterIndex === null || atOrAfterIndex <= record.currentIndex) && Object.is(record.trackById, trackById)) {
        return record;
      }
    }
    return null;
  }
  remove(record) {
    const prev = record._prevDup;
    const next = record._nextDup;
    if (prev === null) {
      this._head = next;
    } else {
      prev._nextDup = next;
    }
    if (next === null) {
      this._tail = prev;
    } else {
      next._prevDup = prev;
    }
    return this._head === null;
  }
};
var _DuplicateMap = class {
  map = /* @__PURE__ */ new Map();
  put(record) {
    const key = record.trackById;
    let duplicates = this.map.get(key);
    if (!duplicates) {
      duplicates = new _DuplicateItemRecordList();
      this.map.set(key, duplicates);
    }
    duplicates.add(record);
  }
  get(trackById, atOrAfterIndex) {
    const key = trackById;
    const recordList = this.map.get(key);
    return recordList ? recordList.get(trackById, atOrAfterIndex) : null;
  }
  remove(record) {
    const key = record.trackById;
    const recordList = this.map.get(key);
    if (recordList.remove(record)) {
      this.map.delete(key);
    }
    return record;
  }
  get isEmpty() {
    return this.map.size === 0;
  }
  clear() {
    this.map.clear();
  }
};
function getPreviousIndex(item, addRemoveOffset, moveOffsets) {
  const previousIndex = item.previousIndex;
  if (previousIndex === null) return previousIndex;
  let moveOffset = 0;
  if (moveOffsets && previousIndex < moveOffsets.length) {
    moveOffset = moveOffsets[previousIndex];
  }
  return previousIndex + addRemoveOffset + moveOffset;
}
var DefaultKeyValueDifferFactory = class {
  supports(obj) {
    return obj instanceof Map || isJsObject(obj);
  }
  create() {
    return new DefaultKeyValueDiffer();
  }
};
var DefaultKeyValueDiffer = class {
  _records = /* @__PURE__ */ new Map();
  _mapHead = null;
  _appendAfter = null;
  _previousMapHead = null;
  _changesHead = null;
  _changesTail = null;
  _additionsHead = null;
  _additionsTail = null;
  _removalsHead = null;
  get isDirty() {
    return this._additionsHead !== null || this._changesHead !== null || this._removalsHead !== null;
  }
  forEachItem(fn) {
    let record;
    for (record = this._mapHead; record !== null; record = record._next) {
      fn(record);
    }
  }
  forEachPreviousItem(fn) {
    let record;
    for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
      fn(record);
    }
  }
  forEachChangedItem(fn) {
    let record;
    for (record = this._changesHead; record !== null; record = record._nextChanged) {
      fn(record);
    }
  }
  forEachAddedItem(fn) {
    let record;
    for (record = this._additionsHead; record !== null; record = record._nextAdded) {
      fn(record);
    }
  }
  forEachRemovedItem(fn) {
    let record;
    for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
      fn(record);
    }
  }
  diff(map2) {
    if (!map2) {
      map2 = /* @__PURE__ */ new Map();
    } else if (!(map2 instanceof Map || isJsObject(map2))) {
      throw new RuntimeError(900, ngDevMode && `Error trying to diff '${stringify(map2)}'. Only maps and objects are allowed`);
    }
    return this.check(map2) ? this : null;
  }
  check(map2) {
    this._reset();
    let insertBefore = this._mapHead;
    this._appendAfter = null;
    this._forEach(map2, (value, key) => {
      if (insertBefore && insertBefore.key === key) {
        this._maybeAddToChanges(insertBefore, value);
        this._appendAfter = insertBefore;
        insertBefore = insertBefore._next;
      } else {
        const record = this._getOrCreateRecordForKey(key, value);
        insertBefore = this._insertBeforeOrAppend(insertBefore, record);
      }
    });
    if (insertBefore) {
      if (insertBefore._prev) {
        insertBefore._prev._next = null;
      }
      this._removalsHead = insertBefore;
      for (let record = insertBefore; record !== null; record = record._nextRemoved) {
        if (record === this._mapHead) {
          this._mapHead = null;
        }
        this._records.delete(record.key);
        record._nextRemoved = record._next;
        record.previousValue = record.currentValue;
        record.currentValue = null;
        record._prev = null;
        record._next = null;
      }
    }
    if (this._changesTail) this._changesTail._nextChanged = null;
    if (this._additionsTail) this._additionsTail._nextAdded = null;
    return this.isDirty;
  }
  _insertBeforeOrAppend(before, record) {
    if (before) {
      const prev = before._prev;
      record._next = before;
      record._prev = prev;
      before._prev = record;
      if (prev) {
        prev._next = record;
      }
      if (before === this._mapHead) {
        this._mapHead = record;
      }
      this._appendAfter = before;
      return before;
    }
    if (this._appendAfter) {
      this._appendAfter._next = record;
      record._prev = this._appendAfter;
    } else {
      this._mapHead = record;
    }
    this._appendAfter = record;
    return null;
  }
  _getOrCreateRecordForKey(key, value) {
    if (this._records.has(key)) {
      const record2 = this._records.get(key);
      this._maybeAddToChanges(record2, value);
      const prev = record2._prev;
      const next = record2._next;
      if (prev) {
        prev._next = next;
      }
      if (next) {
        next._prev = prev;
      }
      record2._next = null;
      record2._prev = null;
      return record2;
    }
    const record = new KeyValueChangeRecord_(key);
    this._records.set(key, record);
    record.currentValue = value;
    this._addToAdditions(record);
    return record;
  }
  _reset() {
    if (this.isDirty) {
      let record;
      this._previousMapHead = this._mapHead;
      for (record = this._previousMapHead; record !== null; record = record._next) {
        record._nextPrevious = record._next;
      }
      for (record = this._changesHead; record !== null; record = record._nextChanged) {
        record.previousValue = record.currentValue;
      }
      for (record = this._additionsHead; record != null; record = record._nextAdded) {
        record.previousValue = record.currentValue;
      }
      this._changesHead = this._changesTail = null;
      this._additionsHead = this._additionsTail = null;
      this._removalsHead = null;
    }
  }
  _maybeAddToChanges(record, newValue) {
    if (!Object.is(newValue, record.currentValue)) {
      record.previousValue = record.currentValue;
      record.currentValue = newValue;
      this._addToChanges(record);
    }
  }
  _addToAdditions(record) {
    if (this._additionsHead === null) {
      this._additionsHead = this._additionsTail = record;
    } else {
      this._additionsTail._nextAdded = record;
      this._additionsTail = record;
    }
  }
  _addToChanges(record) {
    if (this._changesHead === null) {
      this._changesHead = this._changesTail = record;
    } else {
      this._changesTail._nextChanged = record;
      this._changesTail = record;
    }
  }
  _forEach(obj, fn) {
    if (obj instanceof Map) {
      obj.forEach(fn);
    } else {
      Object.keys(obj).forEach((k) => fn(obj[k], k));
    }
  }
};
var KeyValueChangeRecord_ = class {
  key;
  previousValue = null;
  currentValue = null;
  _nextPrevious = null;
  _next = null;
  _prev = null;
  _nextAdded = null;
  _nextRemoved = null;
  _nextChanged = null;
  constructor(key) {
    this.key = key;
  }
};
function defaultIterableDiffersFactory() {
  return new IterableDiffers([new DefaultIterableDifferFactory()]);
}
var IterableDiffers = class _IterableDiffers {
  factories;
  static ɵprov = ɵɵdefineInjectable({
    token: _IterableDiffers,
    providedIn: "root",
    factory: defaultIterableDiffersFactory
  });
  constructor(factories) {
    this.factories = factories;
  }
  static create(factories, parent) {
    if (parent != null) {
      const copied = parent.factories.slice();
      factories = factories.concat(copied);
    }
    return new _IterableDiffers(factories);
  }
  static extend(factories) {
    return {
      provide: _IterableDiffers,
      useFactory: () => {
        const parent = inject(_IterableDiffers, {
          optional: true,
          skipSelf: true
        });
        return _IterableDiffers.create(factories, parent || defaultIterableDiffersFactory());
      }
    };
  }
  find(iterable) {
    const factory = this.factories.find((f) => f.supports(iterable));
    if (factory != null) {
      return factory;
    } else {
      throw new RuntimeError(901, ngDevMode && `Cannot find a differ supporting object '${iterable}' of type '${getTypeNameForDebugging(iterable)}'`);
    }
  }
};
function getTypeNameForDebugging(type) {
  return type["name"] || typeof type;
}
function defaultKeyValueDiffersFactory() {
  return new KeyValueDiffers([new DefaultKeyValueDifferFactory()]);
}
var KeyValueDiffers = class _KeyValueDiffers {
  static ɵprov = ɵɵdefineInjectable({
    token: _KeyValueDiffers,
    providedIn: "root",
    factory: defaultKeyValueDiffersFactory
  });
  factories;
  constructor(factories) {
    this.factories = factories;
  }
  static create(factories, parent) {
    if (parent) {
      const copied = parent.factories.slice();
      factories = factories.concat(copied);
    }
    return new _KeyValueDiffers(factories);
  }
  static extend(factories) {
    return {
      provide: _KeyValueDiffers,
      useFactory: () => {
        const parent = inject(_KeyValueDiffers, {
          optional: true,
          skipSelf: true
        });
        return _KeyValueDiffers.create(factories, parent || defaultKeyValueDiffersFactory());
      }
    };
  }
  find(kv) {
    const factory = this.factories.find((f) => f.supports(kv));
    if (factory) {
      return factory;
    }
    throw new RuntimeError(901, ngDevMode && `Cannot find a differ supporting object '${kv}'`);
  }
};
var keyValDiff = [new DefaultKeyValueDifferFactory()];
var iterableDiff = [new DefaultIterableDifferFactory()];
var defaultIterableDiffers = new IterableDiffers(iterableDiff);
var defaultKeyValueDiffers = new KeyValueDiffers(keyValDiff);
var platformCore = createPlatformFactory(null, "core", []);
var ApplicationModule = class _ApplicationModule {
  constructor(appRef) {
  }
  static ɵfac = function ApplicationModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ApplicationModule)(ɵɵinject(ApplicationRef));
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _ApplicationModule
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ApplicationModule, [{
    type: NgModule
  }], () => [{
    type: ApplicationRef
  }], null);
})();
function internalCreateApplication(config) {
  const {
    rootComponent,
    appProviders,
    platformProviders,
    platformRef
  } = config;
  profiler(ProfilerEvent.BootstrapApplicationStart);
  if (false) {
    throw new RuntimeError(-401, ngDevMode && "Missing Platform: This may be due to using `bootstrapApplication` on the server without passing a `BootstrapContext`. Please make sure that `bootstrapApplication` is called with a `context` argument.");
  }
  try {
    const platformInjector = platformRef?.injector ?? createOrReusePlatformInjector(platformProviders);
    if ((typeof ngDevMode === "undefined" || ngDevMode) && rootComponent !== void 0) {
      assertStandaloneComponentType(rootComponent);
    }
    const allAppProviders = [provideZonelessChangeDetectionInternal(), errorHandlerEnvironmentInitializer, ...ngDevMode ? [validAppIdInitializer] : [], ...appProviders || []];
    const adapter = new EnvironmentNgModuleRefAdapter({
      providers: allAppProviders,
      parent: platformInjector,
      debugName: typeof ngDevMode === "undefined" || ngDevMode ? "Environment Injector" : "",
      runEnvironmentInitializers: false
    });
    return bootstrap({
      r3Injector: adapter.injector,
      platformInjector,
      rootComponent
    });
  } catch (e) {
    return Promise.reject(e);
  } finally {
    profiler(ProfilerEvent.BootstrapApplicationEnd);
  }
}
var SerializedViewCollection = class {
  views = [];
  indexByContent = /* @__PURE__ */ new Map();
  add(serializedView) {
    const viewAsString = JSON.stringify(serializedView);
    if (!this.indexByContent.has(viewAsString)) {
      const index = this.views.length;
      this.views.push(serializedView);
      this.indexByContent.set(viewAsString, index);
      return index;
    }
    return this.indexByContent.get(viewAsString);
  }
  getAll() {
    return this.views;
  }
};
var tViewSsrId = 0;
function getSsrId(tView) {
  if (!tView.ssrId) {
    tView.ssrId = `t${tViewSsrId++}`;
  }
  return tView.ssrId;
}
function calcNumRootNodes(tView, lView, tNode) {
  const rootNodes = [];
  collectNativeNodes(tView, lView, tNode, rootNodes);
  return rootNodes.length;
}
function calcNumRootNodesInLContainer(lContainer) {
  const rootNodes = [];
  collectNativeNodesInLContainer(lContainer, rootNodes);
  return rootNodes.length;
}
function annotateComponentLViewForHydration(lView, context) {
  const hostElement = lView[HOST];
  if (hostElement && !hostElement.hasAttribute(SKIP_HYDRATION_ATTR_NAME)) {
    return annotateHostElementForHydration(hostElement, lView, null, context);
  }
  return null;
}
function annotateLContainerForHydration(lContainer, context) {
  const componentLView = unwrapLView(lContainer[HOST]);
  const componentLViewNghIndex = annotateComponentLViewForHydration(componentLView, context);
  if (componentLViewNghIndex === null) {
    return;
  }
  const hostElement = unwrapRNode(componentLView[HOST]);
  const rootLView = lContainer[PARENT];
  const rootLViewNghIndex = annotateHostElementForHydration(hostElement, rootLView, null, context);
  const renderer = componentLView[RENDERER];
  const finalIndex = `${componentLViewNghIndex}|${rootLViewNghIndex}`;
  renderer.setAttribute(hostElement, NGH_ATTR_NAME, finalIndex);
}
function annotateForHydration(appRef, doc) {
  const injector = appRef.injector;
  const isI18nHydrationEnabledVal = isI18nHydrationEnabled(injector);
  const isIncrementalHydrationEnabledVal = isIncrementalHydrationEnabled(injector);
  const serializedViewCollection = new SerializedViewCollection();
  const corruptedTextNodes = /* @__PURE__ */ new Map();
  const viewRefs = appRef._views;
  const shouldReplayEvents = injector.get(IS_EVENT_REPLAY_ENABLED, EVENT_REPLAY_ENABLED_DEFAULT);
  const eventTypesToReplay = {
    regular: /* @__PURE__ */ new Set(),
    capture: /* @__PURE__ */ new Set()
  };
  const deferBlocks = /* @__PURE__ */ new Map();
  const appId = appRef.injector.get(APP_ID);
  for (const viewRef of viewRefs) {
    const lNode = getLNodeForHydration(viewRef);
    if (lNode !== null) {
      const context = {
        serializedViewCollection,
        corruptedTextNodes,
        isI18nHydrationEnabled: isI18nHydrationEnabledVal,
        isIncrementalHydrationEnabled: isIncrementalHydrationEnabledVal,
        i18nChildren: /* @__PURE__ */ new Map(),
        eventTypesToReplay,
        shouldReplayEvents,
        appId,
        deferBlocks
      };
      if (isLContainer(lNode)) {
        annotateLContainerForHydration(lNode, context);
      } else {
        annotateComponentLViewForHydration(lNode, context);
      }
      insertCorruptedTextNodeMarkers(corruptedTextNodes, doc);
    }
  }
  const serializedViews = serializedViewCollection.getAll();
  const transferState = injector.get(TransferState);
  transferState.set(NGH_DATA_KEY, serializedViews);
  if (deferBlocks.size > 0) {
    const blocks = {};
    for (const [id, info] of deferBlocks.entries()) {
      blocks[id] = info;
    }
    transferState.set(NGH_DEFER_BLOCKS_KEY, blocks);
  }
  return eventTypesToReplay;
}
function serializeLContainer(lContainer, tNode, lView, parentDeferBlockId, context) {
  const views = [];
  let lastViewAsString = "";
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    let childLView = lContainer[i];
    let template;
    let numRootNodes;
    let serializedView;
    if (isRootView(childLView)) {
      childLView = childLView[HEADER_OFFSET];
      if (isLContainer(childLView)) {
        numRootNodes = calcNumRootNodesInLContainer(childLView) + 1;
        annotateLContainerForHydration(childLView, context);
        const componentLView = unwrapLView(childLView[HOST]);
        serializedView = {
          [TEMPLATE_ID]: componentLView[TVIEW].ssrId,
          [NUM_ROOT_NODES]: numRootNodes
        };
      }
    }
    if (!serializedView) {
      const childTView = childLView[TVIEW];
      if (childTView.type === 1) {
        template = childTView.ssrId;
        numRootNodes = 1;
      } else {
        template = getSsrId(childTView);
        numRootNodes = calcNumRootNodes(childTView, childLView, childTView.firstChild);
      }
      serializedView = {
        [TEMPLATE_ID]: template,
        [NUM_ROOT_NODES]: numRootNodes
      };
      let isHydrateNeverBlock = false;
      if (isDeferBlock(lView[TVIEW], tNode)) {
        const lDetails = getLDeferBlockDetails(lView, tNode);
        const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
        if (context.isIncrementalHydrationEnabled && tDetails.hydrateTriggers !== null) {
          const deferBlockId = `d${context.deferBlocks.size}`;
          if (tDetails.hydrateTriggers.has(7)) {
            isHydrateNeverBlock = true;
          }
          let rootNodes = [];
          collectNativeNodesInLContainer(lContainer, rootNodes);
          const deferBlockInfo = {
            [NUM_ROOT_NODES]: rootNodes.length,
            [DEFER_BLOCK_STATE$1]: lDetails[DEFER_BLOCK_STATE]
          };
          const serializedTriggers = serializeHydrateTriggers(tDetails.hydrateTriggers);
          if (serializedTriggers.length > 0) {
            deferBlockInfo[DEFER_HYDRATE_TRIGGERS] = serializedTriggers;
          }
          if (parentDeferBlockId !== null) {
            deferBlockInfo[DEFER_PARENT_BLOCK_ID] = parentDeferBlockId;
          }
          context.deferBlocks.set(deferBlockId, deferBlockInfo);
          const node = unwrapRNode(lContainer);
          if (node !== void 0) {
            if (node.nodeType === Node.COMMENT_NODE) {
              annotateDeferBlockAnchorForHydration(node, deferBlockId);
            }
          } else {
            ngDevMode && validateNodeExists(node, childLView, tNode);
            ngDevMode && validateMatchingNode(node, Node.COMMENT_NODE, null, childLView, tNode, true);
            annotateDeferBlockAnchorForHydration(node, deferBlockId);
          }
          if (!isHydrateNeverBlock) {
            annotateDeferBlockRootNodesWithJsAction(tDetails, rootNodes, deferBlockId, context);
          }
          parentDeferBlockId = deferBlockId;
          serializedView[DEFER_BLOCK_ID] = deferBlockId;
        }
        serializedView[DEFER_BLOCK_STATE$1] = lDetails[DEFER_BLOCK_STATE];
      }
      if (!isHydrateNeverBlock) {
        Object.assign(serializedView, serializeLView(lContainer[i], parentDeferBlockId, context));
      }
    }
    const currentViewAsString = JSON.stringify(serializedView);
    if (views.length > 0 && currentViewAsString === lastViewAsString) {
      const previousView = views[views.length - 1];
      previousView[MULTIPLIER] ??= 1;
      previousView[MULTIPLIER]++;
    } else {
      lastViewAsString = currentViewAsString;
      views.push(serializedView);
    }
  }
  return views;
}
function serializeHydrateTriggers(triggerMap) {
  const serializableDeferBlockTrigger = /* @__PURE__ */ new Set([0, 1, 2, 5]);
  let triggers = [];
  for (let [trigger, details] of triggerMap) {
    if (serializableDeferBlockTrigger.has(trigger)) {
      if (details === null) {
        triggers.push(trigger);
      } else if (details.type === 5) {
        triggers.push({
          trigger,
          delay: details.delay
        });
      } else {
        triggers.push({
          trigger,
          intersectionObserverOptions: details.intersectionObserverOptions
        });
      }
    }
  }
  return triggers;
}
function appendSerializedNodePath(ngh, tNode, lView, excludedParentNodes) {
  const noOffsetIndex = tNode.index - HEADER_OFFSET;
  ngh[NODES] ??= {};
  ngh[NODES][noOffsetIndex] ??= calcPathForNode(tNode, lView, excludedParentNodes);
}
function appendDisconnectedNodeIndex(ngh, tNodeOrNoOffsetIndex) {
  const noOffsetIndex = typeof tNodeOrNoOffsetIndex === "number" ? tNodeOrNoOffsetIndex : tNodeOrNoOffsetIndex.index - HEADER_OFFSET;
  ngh[DISCONNECTED_NODES] ??= [];
  if (!ngh[DISCONNECTED_NODES].includes(noOffsetIndex)) {
    ngh[DISCONNECTED_NODES].push(noOffsetIndex);
  }
}
function serializeLView(lView, parentDeferBlockId = null, context) {
  const ngh = {};
  const tView = lView[TVIEW];
  const i18nChildren = getOrComputeI18nChildren(tView, context);
  const nativeElementsToEventTypes = context.shouldReplayEvents ? collectDomEventsInfo(tView, lView, context.eventTypesToReplay) : null;
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    const tNode = tView.data[i];
    const noOffsetIndex = i - HEADER_OFFSET;
    const i18nData = trySerializeI18nBlock(lView, i, context);
    if (i18nData) {
      ngh[I18N_DATA] ??= {};
      ngh[I18N_DATA][noOffsetIndex] = i18nData.caseQueue;
      for (const nodeNoOffsetIndex of i18nData.disconnectedNodes) {
        appendDisconnectedNodeIndex(ngh, nodeNoOffsetIndex);
      }
      for (const nodeNoOffsetIndex of i18nData.disjointNodes) {
        const tNode2 = tView.data[nodeNoOffsetIndex + HEADER_OFFSET];
        ngDevMode && assertTNode(tNode2);
        appendSerializedNodePath(ngh, tNode2, lView, i18nChildren);
      }
      continue;
    }
    if (!isTNodeShape(tNode)) {
      continue;
    }
    if (isDetachedByI18n(tNode)) {
      continue;
    }
    if (isLContainer(lView[i]) && tNode.tView) {
      ngh[TEMPLATES] ??= {};
      ngh[TEMPLATES][noOffsetIndex] = getSsrId(tNode.tView);
    }
    if (isDisconnectedNode(tNode, lView) && isContentProjectedNode(tNode)) {
      appendDisconnectedNodeIndex(ngh, tNode);
      continue;
    }
    if (Array.isArray(tNode.projection)) {
      for (const projectionHeadTNode of tNode.projection) {
        if (!projectionHeadTNode) continue;
        if (!Array.isArray(projectionHeadTNode)) {
          if (!isProjectionTNode(projectionHeadTNode) && !isInSkipHydrationBlock2(projectionHeadTNode)) {
            if (isDisconnectedNode(projectionHeadTNode, lView)) {
              appendDisconnectedNodeIndex(ngh, projectionHeadTNode);
            } else {
              appendSerializedNodePath(ngh, projectionHeadTNode, lView, i18nChildren);
            }
          }
        } else {
          throw unsupportedProjectionOfDomNodes(unwrapRNode(lView[i]));
        }
      }
    }
    conditionallyAnnotateNodePath(ngh, tNode, lView, i18nChildren);
    if (isLContainer(lView[i])) {
      const hostNode = lView[i][HOST];
      if (Array.isArray(hostNode)) {
        const targetNode = unwrapRNode(hostNode);
        if (!targetNode.hasAttribute(SKIP_HYDRATION_ATTR_NAME)) {
          annotateHostElementForHydration(targetNode, hostNode, parentDeferBlockId, context);
        }
      }
      ngh[CONTAINERS] ??= {};
      ngh[CONTAINERS][noOffsetIndex] = serializeLContainer(lView[i], tNode, lView, parentDeferBlockId, context);
    } else if (Array.isArray(lView[i]) && !isLetDeclaration(tNode)) {
      const targetNode = unwrapRNode(lView[i][HOST]);
      if (!targetNode.hasAttribute(SKIP_HYDRATION_ATTR_NAME)) {
        annotateHostElementForHydration(targetNode, lView[i], parentDeferBlockId, context);
      }
    } else {
      if (tNode.type & 8) {
        ngh[ELEMENT_CONTAINERS] ??= {};
        ngh[ELEMENT_CONTAINERS][noOffsetIndex] = calcNumRootNodes(tView, lView, tNode.child);
      } else if (tNode.type & (16 | 128)) {
        let nextTNode = tNode.next;
        while (nextTNode !== null && nextTNode.type & (16 | 128)) {
          nextTNode = nextTNode.next;
        }
        if (nextTNode && !isInSkipHydrationBlock2(nextTNode)) {
          appendSerializedNodePath(ngh, nextTNode, lView, i18nChildren);
        }
      } else if (tNode.type & 1) {
        const rNode = unwrapRNode(lView[i]);
        processTextNodeBeforeSerialization(context, rNode);
      }
    }
    if (nativeElementsToEventTypes && tNode.type & 2) {
      const nativeElement = unwrapRNode(lView[i]);
      if (nativeElementsToEventTypes.has(nativeElement)) {
        setJSActionAttributes(nativeElement, nativeElementsToEventTypes.get(nativeElement), parentDeferBlockId);
      }
    }
  }
  return ngh;
}
function conditionallyAnnotateNodePath(ngh, tNode, lView, excludedParentNodes) {
  if (isProjectionTNode(tNode)) {
    return;
  }
  if (tNode.projectionNext && tNode.projectionNext !== tNode.next && !isInSkipHydrationBlock2(tNode.projectionNext)) {
    appendSerializedNodePath(ngh, tNode.projectionNext, lView, excludedParentNodes);
  }
  if (tNode.prev === null && tNode.parent !== null && isDisconnectedNode(tNode.parent, lView) && !isDisconnectedNode(tNode, lView)) {
    appendSerializedNodePath(ngh, tNode, lView, excludedParentNodes);
  }
}
function componentUsesShadowDomEncapsulation(lView) {
  const instance = lView[CONTEXT];
  if (!instance?.constructor) return false;
  const def = getComponentDef(instance.constructor);
  return def?.encapsulation === ViewEncapsulation.ShadowDom || def?.encapsulation === ViewEncapsulation.ExperimentalIsolatedShadowDom;
}
function annotateHostElementForHydration(element, lView, parentDeferBlockId, context) {
  const renderer = lView[RENDERER];
  if (hasI18n(lView) && !isI18nHydrationSupportEnabled() || componentUsesShadowDomEncapsulation(lView)) {
    renderer.setAttribute(element, SKIP_HYDRATION_ATTR_NAME, "");
    return null;
  } else {
    const ngh = serializeLView(lView, parentDeferBlockId, context);
    const index = context.serializedViewCollection.add(ngh);
    renderer.setAttribute(element, NGH_ATTR_NAME, index.toString());
    return index;
  }
}
function annotateDeferBlockAnchorForHydration(comment, deferBlockId) {
  comment.textContent = `ngh=${deferBlockId}`;
}
function insertCorruptedTextNodeMarkers(corruptedTextNodes, doc) {
  for (const [textNode, marker] of corruptedTextNodes) {
    textNode.after(doc.createComment(marker));
  }
}
function isContentProjectedNode(tNode) {
  let currentTNode = tNode;
  while (currentTNode != null) {
    if (isComponentHost(currentTNode)) {
      return true;
    }
    currentTNode = currentTNode.parent;
  }
  return false;
}
function annotateDeferBlockRootNodesWithJsAction(tDetails, rootNodes, parentDeferBlockId, context) {
  const actionList = convertHydrateTriggersToJsAction(tDetails.hydrateTriggers);
  for (let et of actionList) {
    context.eventTypesToReplay.regular.add(et);
  }
  if (actionList.length > 0) {
    const elementNodes = rootNodes.filter((rn) => rn.nodeType === Node.ELEMENT_NODE);
    for (let rNode of elementNodes) {
      setJSActionAttributes(rNode, actionList, parentDeferBlockId);
    }
  }
}
function booleanAttribute(value) {
  return typeof value === "boolean" ? value : value != null && value !== "false";
}
function numberAttribute(value, fallbackValue = NaN) {
  const isNumberValue = !isNaN(parseFloat(value)) && !isNaN(Number(value));
  return isNumberValue ? Number(value) : fallbackValue;
}
var PERFORMANCE_MARK_PREFIX = "🅰️";
var enablePerfLogging = false;
function startMeasuring(label) {
  if (!enablePerfLogging) {
    return;
  }
  const {
    startLabel
  } = labels(label);
  performance.mark(startLabel);
}
function stopMeasuring(label) {
  if (!enablePerfLogging) {
    return;
  }
  const {
    startLabel,
    labelName,
    endLabel
  } = labels(label);
  performance.mark(endLabel);
  performance.measure(labelName, startLabel, endLabel);
  performance.clearMarks(startLabel);
  performance.clearMarks(endLabel);
}
function labels(label) {
  const labelName = `${PERFORMANCE_MARK_PREFIX}:${label}`;
  return {
    labelName,
    startLabel: `start:${labelName}`,
    endLabel: `end:${labelName}`
  };
}
var warningLogged = false;
function enableProfiling2() {
  if (!warningLogged && (typeof performance === "undefined" || !performance.mark || !performance.measure)) {
    warningLogged = true;
    console.warn("Performance API is not supported on this platform");
    return;
  }
  enablePerfLogging = true;
}
function disableProfiling() {
  enablePerfLogging = false;
}
function getClosestComponentName(node) {
  let currentNode = node;
  while (currentNode) {
    const lView = readPatchedLView(currentNode);
    if (lView !== null) {
      for (let i = HEADER_OFFSET; i < lView.length; i++) {
        const current = lView[i];
        if (!isLView(current) && !isLContainer(current) || current[HOST] !== currentNode) {
          continue;
        }
        const tView = lView[TVIEW];
        const tNode = getTNode(tView, i);
        if (isComponentHost(tNode)) {
          const def = tView.data[tNode.directiveStart + tNode.componentOffset];
          const name = def.debugInfo?.className || def.type.name;
          if (name) {
            return name;
          } else {
            break;
          }
        }
      }
    }
    currentNode = currentNode.parentNode;
  }
  return null;
}
function ɵassertType(value) {
}
function ɵɵngDeclareDirective(decl) {
  const compiler = getCompilerFacade({
    usage: 1,
    kind: "directive",
    type: decl.type
  });
  return compiler.compileDirectiveDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵfac.js`, decl);
}
function ɵɵngDeclareClassMetadata(decl) {
  setClassMetadata(decl.type, decl.decorators, decl.ctorParameters ?? null, decl.propDecorators ?? null);
}
function ɵɵngDeclareClassMetadataAsync(decl) {
  setClassMetadataAsync(decl.type, decl.resolveDeferredDeps, (...types) => {
    const meta = decl.resolveMetadata(...types);
    setClassMetadata(decl.type, meta.decorators, meta.ctorParameters, meta.propDecorators);
  });
}
function ɵɵngDeclareComponent(decl) {
  const compiler = getCompilerFacade({
    usage: 1,
    kind: "component",
    type: decl.type
  });
  return compiler.compileComponentDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵcmp.js`, decl);
}
function ɵɵngDeclareFactory(decl) {
  const compiler = getCompilerFacade({
    usage: 1,
    kind: getFactoryKind(decl.target),
    type: decl.type
  });
  return compiler.compileFactoryDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵfac.js`, decl);
}
function getFactoryKind(target) {
  switch (target) {
    case FactoryTarget.Directive:
      return "directive";
    case FactoryTarget.Component:
      return "component";
    case FactoryTarget.Injectable:
      return "injectable";
    case FactoryTarget.Pipe:
      return "pipe";
    case FactoryTarget.NgModule:
      return "NgModule";
  }
}
function ɵɵngDeclareInjectable(decl) {
  const compiler = getCompilerFacade({
    usage: 1,
    kind: "injectable",
    type: decl.type
  });
  return compiler.compileInjectableDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵprov.js`, decl);
}
function ɵɵngDeclareInjector(decl) {
  const compiler = getCompilerFacade({
    usage: 1,
    kind: "NgModule",
    type: decl.type
  });
  return compiler.compileInjectorDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵinj.js`, decl);
}
function ɵɵngDeclareNgModule(decl) {
  const compiler = getCompilerFacade({
    usage: 1,
    kind: "NgModule",
    type: decl.type
  });
  return compiler.compileNgModuleDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵmod.js`, decl);
}
function ɵɵngDeclarePipe(decl) {
  const compiler = getCompilerFacade({
    usage: 1,
    kind: "pipe",
    type: decl.type
  });
  return compiler.compilePipeDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵpipe.js`, decl);
}
var NOT_SET = /* @__PURE__ */ Symbol("NOT_SET");
var EMPTY_CLEANUP_SET = /* @__PURE__ */ new Set();
var AFTER_RENDER_PHASE_EFFECT_NODE = (() => __spreadProps(__spreadValues({}, SIGNAL_NODE), {
  kind: "afterRenderEffectPhase",
  consumerIsAlwaysLive: true,
  consumerAllowSignalWrites: true,
  value: NOT_SET,
  cleanup: null,
  consumerMarkedDirty() {
    if (this.sequence.impl.executing) {
      if (this.sequence.lastPhase === null || this.sequence.lastPhase < this.phase) {
        return;
      }
      this.sequence.erroredOrDestroyed = true;
    }
    this.sequence.scheduler.notify(7);
  },
  phaseFn(previousValue) {
    this.sequence.lastPhase = this.phase;
    if (!this.dirty) {
      return this.signal;
    }
    this.dirty = false;
    if (this.value !== NOT_SET && !consumerPollProducersForChange(this)) {
      return this.signal;
    }
    try {
      for (const cleanupFn of this.cleanup ?? EMPTY_CLEANUP_SET) {
        cleanupFn();
      }
    } finally {
      this.cleanup?.clear();
    }
    const args = [];
    if (previousValue !== void 0) {
      args.push(previousValue);
    }
    args.push(this.registerCleanupFn);
    const prevConsumer = consumerBeforeComputation(this);
    let newValue;
    try {
      newValue = this.userFn.apply(null, args);
    } finally {
      consumerAfterComputation(this, prevConsumer);
    }
    if (this.value === NOT_SET || !this.equal(this.value, newValue)) {
      this.value = newValue;
      this.version++;
    }
    return this.signal;
  }
}))();
var AfterRenderEffectSequence = class extends AfterRenderSequence {
  scheduler;
  lastPhase = null;
  nodes = [void 0, void 0, void 0, void 0];
  onDestroyFns = null;
  constructor(impl, effectHooks, view, scheduler, injector, snapshot = null) {
    super(impl, [void 0, void 0, void 0, void 0], view, false, injector.get(DestroyRef), snapshot);
    this.scheduler = scheduler;
    for (const phase of AFTER_RENDER_PHASES) {
      const effectHook = effectHooks[phase];
      if (effectHook === void 0) {
        continue;
      }
      const node = Object.create(AFTER_RENDER_PHASE_EFFECT_NODE);
      node.sequence = this;
      node.phase = phase;
      node.userFn = effectHook;
      node.dirty = true;
      node.signal = () => {
        producerAccessed(node);
        return node.value;
      };
      node.signal[SIGNAL] = node;
      node.registerCleanupFn = (fn) => (node.cleanup ??= /* @__PURE__ */ new Set()).add(fn);
      this.nodes[phase] = node;
      this.hooks[phase] = (value) => node.phaseFn(value);
      if (ngDevMode) {
        setupDebugInfo(node, injector);
      }
    }
  }
  afterRun() {
    super.afterRun();
    this.lastPhase = null;
  }
  destroy() {
    if (this.onDestroyFns !== null) {
      for (const fn of this.onDestroyFns) {
        fn();
      }
    }
    super.destroy();
    for (const node of this.nodes) {
      if (node) {
        try {
          for (const fn of node.cleanup ?? EMPTY_CLEANUP_SET) {
            fn();
          }
        } finally {
          consumerDestroy(node);
        }
      }
    }
  }
};
function afterRenderEffect(callbackOrSpec, options) {
  ngDevMode && assertNotInReactiveContext(afterRenderEffect, "Call `afterRenderEffect` outside of a reactive context. For example, create the render effect inside the component constructor`.");
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(afterRenderEffect);
  }
  if (false) {
    return NOOP_AFTER_RENDER_REF;
  }
  const injector = options?.injector ?? inject(Injector);
  const scheduler = injector.get(ChangeDetectionScheduler);
  const manager = injector.get(AfterRenderManager);
  const tracing = injector.get(TracingService, null, {
    optional: true
  });
  manager.impl ??= injector.get(AfterRenderImpl);
  let spec = callbackOrSpec;
  if (typeof spec === "function") {
    spec = {
      mixedReadWrite: callbackOrSpec
    };
  }
  const viewContext = injector.get(ViewContext, null, {
    optional: true
  });
  const sequence = new AfterRenderEffectSequence(manager.impl, [spec.earlyRead, spec.write, spec.mixedReadWrite, spec.read], viewContext?.view, scheduler, injector, tracing?.snapshot(null));
  manager.impl.register(sequence);
  return sequence;
}
function setupDebugInfo(node, injector) {
  node.debugName = `afterRenderEffect - ${phaseDebugName(node.phase)} phase`;
  const prevInjectorProfilerContext = setInjectorProfilerContext({
    injector,
    token: null
  });
  try {
    emitAfterRenderEffectPhaseCreatedEvent(node);
  } finally {
    setInjectorProfilerContext(prevInjectorProfilerContext);
  }
}
function phaseDebugName(phase) {
  switch (phase) {
    case 0:
      return "EarlyRead";
    case 1:
      return "Write";
    case 2:
      return "MixedReadWrite";
    case 3:
      return "Read";
  }
}
function createComponent(component, options) {
  ngDevMode && assertComponentDef(component);
  const componentDef = getComponentDef(component);
  const elementInjector = options.elementInjector || getNullInjector();
  const factory = new ComponentFactory2(componentDef);
  return factory.create(elementInjector, options.projectableNodes, options.hostElement, options.environmentInjector, options.directives, options.bindings);
}
function reflectComponentType(component) {
  const componentDef = getComponentDef(component);
  if (!componentDef) return null;
  const factory = new ComponentFactory2(componentDef);
  return {
    get selector() {
      return factory.selector;
    },
    get type() {
      return factory.componentType;
    },
    get inputs() {
      return factory.inputs;
    },
    get outputs() {
      return factory.outputs;
    },
    get ngContentSelectors() {
      return factory.ngContentSelectors;
    },
    get isStandalone() {
      return componentDef.standalone;
    },
    get isSignal() {
      return componentDef.signals;
    }
  };
}
function mergeApplicationConfig(...configs) {
  return configs.reduce((prev, curr) => {
    return Object.assign(prev, curr, {
      providers: [...prev.providers, ...curr.providers]
    });
  }, {
    providers: []
  });
}
var REQUEST = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "REQUEST" : "", {
  providedIn: "platform",
  factory: () => null
});
var RESPONSE_INIT = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "RESPONSE_INIT" : "", {
  providedIn: "platform",
  factory: () => null
});
var REQUEST_CONTEXT = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "REQUEST_CONTEXT" : "", {
  providedIn: "platform",
  factory: () => null
});

export {
  noSideEffects,
  Inject,
  Optional,
  Self,
  SkipSelf,
  Host,
  Type,
  ReflectionCapabilities,
  SimpleChange,
  ɵɵNgOnChangesFeature,
  ProfilerEvent,
  ɵɵgetInheritedFactory,
  ɵɵinjectAttribute,
  Attribute2 as Attribute,
  Injectable,
  ElementRef,
  QueryList,
  ChangeDetectionStrategy,
  LContext,
  getLContext,
  getDirectives,
  AcxChangeDetectionStrategy,
  AcxViewEncapsulation,
  getHostElement,
  setDocument,
  getDocument,
  APP_ID,
  PLATFORM_INITIALIZER,
  PLATFORM_ID,
  ANIMATION_MODULE_TYPE,
  CSP_NONCE,
  IMAGE_CONFIG_DEFAULTS,
  IMAGE_CONFIG,
  makeStateKey,
  TransferState,
  IS_HYDRATION_DOM_REUSE_ENABLED,
  EVENT_REPLAY_QUEUE,
  IS_INCREMENTAL_HYDRATION_ENABLED,
  JSACTION_BLOCK_ELEMENT_MAP,
  IS_ENABLED_BLOCKING_INITIAL_NAVIGATION,
  JSACTION_EVENT_CONTRACT,
  DEHYDRATED_BLOCK_REGISTRY,
  SSR_CONTENT_INTEGRITY_MARKER,
  HydrationStatus,
  readHydrationInfo,
  resetIncrementalHydrationEnabledWarnedForTests,
  ViewEncapsulation,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  ɵsetUnknownElementStrictMode,
  ɵgetUnknownElementStrictMode,
  ɵsetUnknownPropertyStrictMode,
  ɵgetUnknownPropertyStrictMode,
  unwrapSafeValue,
  allowSanitizationBypassAndThrow,
  getSanitizationBypassType,
  bypassSanitizationTrustHtml,
  bypassSanitizationTrustStyle,
  bypassSanitizationTrustScript,
  bypassSanitizationTrustUrl,
  bypassSanitizationTrustResourceUrl,
  _sanitizeUrl,
  _sanitizeHtml,
  SecurityContext,
  ɵɵsanitizeHtml,
  ɵɵsanitizeStyle,
  ɵɵsanitizeUrl,
  ɵɵsanitizeResourceUrl,
  ɵɵsanitizeScript,
  ɵɵtrustConstantHtml,
  ɵɵtrustConstantResourceUrl,
  ɵɵsanitizeUrlOrResourceUrl,
  ɵɵvalidateAttribute,
  provideNgReflectAttributes,
  ɵɵresolveWindow,
  ɵɵresolveDocument,
  ɵɵresolveBody,
  NO_CHANGE,
  ɵɵadvance,
  RendererStyleFlags2,
  allLeavingAnimations,
  TracingAction,
  TracingService,
  performanceMarkFeature,
  AfterRenderManager,
  afterEveryRender,
  afterNextRender,
  ViewRef,
  isViewDirty,
  markForRefresh,
  TemplateRef,
  ComponentRef$1,
  ComponentFactory$1,
  ComponentFactoryResolver$1,
  RendererFactory2,
  Renderer2,
  Sanitizer,
  isNgModule,
  depsTracker,
  NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR,
  ɵɵdirectiveInject,
  ɵɵinvalidFactory,
  devModeEqual,
  ɵCONTROL,
  inputBinding,
  outputBinding,
  twoWayBinding,
  inferTagNameFromDefinition,
  ComponentFactory2 as ComponentFactory,
  ComponentRef2 as ComponentRef,
  ViewContainerRef,
  resolveComponentResources,
  isComponentDefPendingResolution,
  clearResolutionOfComponentResourcesQueue,
  restoreComponentResolutionQueue,
  registerNgModuleType,
  setAllowDuplicateNgModuleIdsForTest,
  NgModuleRef$1,
  NgModuleFactory$1,
  createNgModule,
  createNgModuleRef,
  NgModuleRef2 as NgModuleRef,
  NgModuleFactory2 as NgModuleFactory,
  createEnvironmentInjector,
  ɵɵdefineComponent,
  ɵɵdefineNgModule,
  ɵɵdefineDirective,
  ɵɵdefinePipe,
  ɵɵHostDirectivesFeature,
  ɵɵInheritDefinitionFeature,
  ɵɵtemplate,
  ɵɵdomTemplate,
  DeferBlockState,
  DeferBlockBehavior,
  TimerScheduler,
  DEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
  DEFER_BLOCK_CONFIG,
  renderDeferBlockState,
  ɵɵdeferEnableTimerScheduling,
  getAsyncClassMetadataFn,
  setClassMetadataAsync,
  setClassMetadata,
  Console,
  isSignal,
  isWritableSignal,
  getDeferBlocks$1,
  enableProfiling,
  getTransferState,
  publishExternalGlobalUtil,
  TESTABILITY,
  TESTABILITY_GETTER,
  Testability,
  TestabilityRegistry,
  setTestabilityGetter,
  isPromise,
  isSubscribable,
  APP_INITIALIZER,
  provideAppInitializer,
  ApplicationInitStatus,
  APP_BOOTSTRAP_LISTENER,
  isBoundToModule,
  ApplicationRef,
  promiseWithResolvers,
  triggerResourceLoading,
  ɵɵdefer,
  ɵɵdeferWhen,
  ɵɵdeferPrefetchWhen,
  ɵɵdeferHydrateWhen,
  ɵɵdeferHydrateNever,
  ɵɵdeferOnIdle,
  ɵɵdeferPrefetchOnIdle,
  ɵɵdeferHydrateOnIdle,
  ɵɵdeferOnImmediate,
  ɵɵdeferPrefetchOnImmediate,
  ɵɵdeferHydrateOnImmediate,
  ɵɵdeferOnTimer,
  ɵɵdeferPrefetchOnTimer,
  ɵɵdeferHydrateOnTimer,
  ɵɵdeferOnHover,
  ɵɵdeferPrefetchOnHover,
  ɵɵdeferHydrateOnHover,
  ɵɵdeferOnInteraction,
  ɵɵdeferPrefetchOnInteraction,
  ɵɵdeferHydrateOnInteraction,
  ɵɵdeferOnViewport,
  ɵɵdeferPrefetchOnViewport,
  ɵɵdeferHydrateOnViewport,
  ɵɵariaProperty,
  ɵɵattribute,
  ANIMATIONS_DISABLED,
  MAX_ANIMATION_TIMEOUT,
  ɵɵanimateEnter,
  ɵɵanimateEnterListener,
  ɵɵanimateLeave,
  ɵɵanimateLeaveListener,
  ɵɵcomponentInstance,
  ɵɵcontrolCreate,
  ɵɵcontrol,
  ɵcontrolUpdate,
  ɵɵconditionalCreate,
  ɵɵconditionalBranchCreate,
  ɵɵconditional,
  ɵɵrepeaterTrackByIndex,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterCreate,
  ɵɵrepeater,
  ɵɵproperty,
  ɵɵelementStart,
  ɵɵelementEnd,
  ɵɵelement,
  ɵɵdomElementStart,
  ɵɵdomElementEnd,
  ɵɵdomElement,
  ɵɵelementContainerStart,
  ɵɵelementContainerEnd,
  ɵɵelementContainer,
  ɵɵdomElementContainerStart,
  ɵɵdomElementContainerEnd,
  ɵɵdomElementContainer,
  ɵɵgetCurrentView,
  ɵɵdomProperty,
  ɵɵsyntheticHostProperty,
  registerLocaleData,
  findLocaleData,
  getLocaleCurrencyCode,
  getLocalePluralCase,
  unregisterAllLocaleData,
  LocaleDataIndex,
  DEFAULT_LOCALE_ID,
  setLocaleId,
  ɵɵi18nStart,
  ɵɵi18nEnd,
  ɵɵi18n,
  ɵɵi18nAttributes,
  ɵɵi18nExp,
  ɵɵi18nApply,
  ɵɵi18nPostprocess,
  ɵɵlistener,
  ɵɵsyntheticHostListener,
  ɵɵdomListener,
  ɵɵnextContext,
  ɵɵprojectionDef,
  ɵɵprojection,
  ɵɵcontentQuery,
  ɵɵviewQuery,
  ɵɵqueryRefresh,
  ɵɵloadQuery,
  ɵɵcontentQuerySignal,
  ɵɵviewQuerySignal,
  ɵɵqueryAdvance,
  ɵɵreference,
  ɵɵstyleProp,
  ɵɵclassProp,
  ɵɵstyleMap,
  ɵɵclassMap,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtextInterpolate3,
  ɵɵtextInterpolate4,
  ɵɵtextInterpolate5,
  ɵɵtextInterpolate6,
  ɵɵtextInterpolate7,
  ɵɵtextInterpolate8,
  ɵɵtextInterpolateV,
  ɵɵtwoWayProperty,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵdeclareLet,
  ɵɵstoreLet,
  ɵɵreadContextLet,
  ɵɵattachSourceLocations,
  ɵɵinterpolate,
  ɵɵinterpolate1,
  ɵɵinterpolate2,
  ɵɵinterpolate3,
  ɵɵinterpolate4,
  ɵɵinterpolate5,
  ɵɵinterpolate6,
  ɵɵinterpolate7,
  ɵɵinterpolate8,
  ɵɵinterpolateV,
  ɵɵProvidersFeature,
  ɵɵExternalStylesFeature,
  ɵɵsetComponentScope,
  ɵɵsetNgModuleScope,
  ɵɵpureFunction0,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵpureFunction3,
  ɵɵpureFunction4,
  ɵɵpureFunction5,
  ɵɵpureFunction6,
  ɵɵpureFunction7,
  ɵɵpureFunction8,
  ɵɵpureFunctionV,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵpipeBind3,
  ɵɵpipeBind4,
  ɵɵpipeBindV,
  ɵɵtemplateRefExtractor,
  ɵɵgetComponentDepsFactory,
  ɵsetClassDebugInfo,
  ɵɵgetReplaceMetadataURL,
  ɵɵreplaceMetadata,
  resetJitOptions,
  flushModuleScopingQueueAsMuchAsPossible,
  compileNgModule,
  compileNgModuleDefs,
  generateStandaloneInDeclarationsError,
  resetCompiledComponents,
  patchComponentDefWithScope,
  transitiveScopesFor,
  compileComponent,
  compileDirective,
  compilePipe,
  Directive,
  Component,
  Pipe,
  Input,
  Output,
  HostBinding,
  HostListener,
  NgModule,
  ModuleWithComponentFactories,
  Compiler,
  COMPILER_OPTIONS,
  CompilerFactory,
  provideZonelessChangeDetection,
  provideZonelessChangeDetectionInternal,
  LOCALE_ID,
  DEFAULT_CURRENCY_CODE,
  TRANSLATIONS,
  TRANSLATIONS_FORMAT,
  MissingTranslationStrategy,
  DebugEventListener,
  asNativeElements,
  DebugNode,
  DebugElement,
  getDebugNode,
  ɵINPUT_SIGNAL_BRAND_WRITE_TYPE,
  FactoryTarget,
  Framework,
  HostAttributeToken,
  HOST_TAG_NAME,
  output,
  input,
  viewChild,
  viewChildren,
  contentChild,
  contentChildren,
  model,
  Query,
  ContentChildren,
  ContentChild,
  ViewChildren,
  ViewChild,
  compileNgModuleFactory,
  PROVIDED_NG_ZONE,
  internalProvideZoneChangeDetection,
  provideZoneChangeDetection,
  ENABLE_ROOT_COMPONENT_BOOTSTRAP,
  PlatformRef,
  createPlatform,
  createPlatformFactory,
  assertPlatform,
  getPlatform,
  destroyPlatform,
  createOrReusePlatformInjector,
  providePlatformInitializer,
  provideCheckNoChangesConfig,
  isDevMode,
  enableProdMode,
  withEventReplay,
  CLIENT_RENDER_MODE_FLAG,
  withDomHydration,
  withI18nSupport,
  withIncrementalHydration,
  provideStabilityDebugging,
  getModuleFactory,
  getNgModuleById,
  ChangeDetectorRef,
  injectChangeDetectorRef,
  ViewRef2,
  EmbeddedViewRef,
  DefaultIterableDiffer,
  IterableDiffers,
  KeyValueDiffers,
  defaultIterableDiffers,
  defaultKeyValueDiffers,
  platformCore,
  ApplicationModule,
  internalCreateApplication,
  annotateForHydration,
  booleanAttribute,
  numberAttribute,
  PERFORMANCE_MARK_PREFIX,
  startMeasuring,
  stopMeasuring,
  enableProfiling2,
  disableProfiling,
  getClosestComponentName,
  ɵassertType,
  ɵɵngDeclareDirective,
  ɵɵngDeclareClassMetadata,
  ɵɵngDeclareClassMetadataAsync,
  ɵɵngDeclareComponent,
  ɵɵngDeclareFactory,
  ɵɵngDeclareInjectable,
  ɵɵngDeclareInjector,
  ɵɵngDeclareNgModule,
  ɵɵngDeclarePipe,
  afterRenderEffect,
  createComponent,
  reflectComponentType,
  mergeApplicationConfig,
  REQUEST,
  RESPONSE_INIT,
  REQUEST_CONTEXT
};
//# sourceMappingURL=chunk-TC5VV5YR.js.map
