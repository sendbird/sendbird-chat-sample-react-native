import {Route, StackActions, createNavigationContainerRef, useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootContextData} from '../contexts/RootContext';

type ExtractParams<R extends Routes, U extends RouteParamsUnion> = U extends {
  route: R;
  params: infer P;
}
  ? P
  : never;
type RouteParams<R extends Routes> = ExtractParams<R, RouteParamsUnion>;
type ParamListBase<T extends RouteParamsUnion = RouteParamsUnion> = {
  [k in T['route']]: T extends {route: k; params: infer P} ? P : never;
};

type RouteProps<T extends Routes, P extends Record<string, unknown> = Record<string, string>> = {
  navigation: NativeStackNavigationProp<ParamListBase, T>;
  route: Route<T, RouteParams<T>>;
} & P;

type ScreenPropsNavigation<T extends Routes> = RouteProps<T>['navigation'];
type ScreenPropsRoute<T extends Routes> = RouteProps<T>['route'];

type ChannelUrlParams = {channelUrl: string};
type RouteParamsUnion =
  | {
      route: Routes.Connect;
      params: undefined;
    }
  | {
      route: Routes.GroupChannelList;
      params: undefined;
    }
  | {
      route: Routes.GroupChannelCreate;
      params: undefined;
    }
  | {
      route: Routes.GroupChannel;
      params: ChannelUrlParams;
    }
  | {
      route: Routes.GroupChannelInvite;
      params: ChannelUrlParams;
    };
export enum Routes {
  Connect = 'Connect',
  GroupChannelCreate = 'GroupChannelCreate',
  GroupChannelList = 'GroupChannelList',
  GroupChannel = 'GroupChannel',
  GroupChannelInvite = 'GroupChannelInvite',
}

export const useAppNavigation = <T extends Routes>() => {
  const navigation = useNavigation<ScreenPropsNavigation<T>>();
  const {params} = useRoute<ScreenPropsRoute<T>>();

  return {navigation, params: params as NonNullable<typeof params>};
};
export const navigationRef = createNavigationContainerRef<ParamListBase>();
export const navigationActions = {
  navigate<T extends Routes>(name: T, params: RouteParams<T>) {
    if (navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute?.name && currentRoute.name === name) {
        // navigationRef.setParams(params);
        navigationRef.dispatch(StackActions.replace(name, params));
      } else {
        // @ts-ignore
        navigationRef.navigate<Routes>(name, params);
      }
    }
  },
  push<T extends Routes>(name: T, params: RouteParams<T>) {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.push(name, params));
    }
  },
  goBack() {
    if (navigationRef.isReady()) {
      navigationRef.goBack();
    }
  },
};
