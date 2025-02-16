/* eslint-disable */
// THIS FILE WAS GENERATED
// ALL CHANGES WILL BE OVERWRITTEN

// INFRASTRUCTURE START
  type StandardError = globalThis.Error;
  type Error500s = 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;
  type ErrorStatuses = 0 | Error500s;
  export type ErrorResponse = FetchResponse<unknown, ErrorStatuses>;

  export type FetchResponseOfError = {
    data: null;
    error: StandardError;
    status: ErrorStatuses;
    args: any;
  };

  export type FetchResponseOfSuccess<TData, TStatus extends number = 0> = 
  {
    data: TData;
    error: null;
    status: TStatus;
    args: any;
    responseHeaders: Headers;
  };

  export type FetchResponse<TData, TStatus extends number = 0> = 
    TStatus extends ErrorStatuses ? FetchResponseOfError: FetchResponseOfSuccess<TData, TStatus>;

  type TerminateRequest = null;
  type TerminateResponse = null;

  type Configuration = {
    apiUrl: string | (() => string);
    jwtKey: string | undefined | (() => string | null | undefined);
    requestMiddlewares?: Array<{
      name: string;
      fn: (request: FetchArgs) => FetchArgs | TerminateRequest;
    }>;
    responseMiddlewares?: Array<{
      name: string;
      fn: (
        response: FetchResponse<unknown, any>
      ) => FetchResponse<unknown, any> | TerminateResponse;
    }>;
  };

  let CONFIG: Configuration = {
    apiUrl: () => "",
    jwtKey: undefined,
    requestMiddlewares: [],
    responseMiddlewares: [],
  };

  export function configureApiCalls(configuration: Configuration) {
    CONFIG = {
      ...CONFIG,
      ...configuration,
      requestMiddlewares: [
        ...(CONFIG.requestMiddlewares || []),
        ...(configuration.requestMiddlewares || []),
      ],
      responseMiddlewares: [
        ...(CONFIG.responseMiddlewares || []),
        ...(configuration.responseMiddlewares || []),
      ],
    };
  }

  function getApiUrl() {
    if (typeof CONFIG.apiUrl === "function") {
      return CONFIG.apiUrl();
    }
    return CONFIG.apiUrl;
  }

  type Termination = {
    termination: {
      name: string;
    };
  };

  function processRequestWithMiddlewares(
    request: FetchArgs
  ): FetchArgs | Termination {
    for (const middleware of CONFIG.requestMiddlewares || []) {
      try {
        const middlewareResponse = middleware.fn(request);
        if (middlewareResponse === null) {
          return { termination: { name: middleware.name } };
        }
        request = middlewareResponse;
      } catch (e) {
        console.error("Request middleware error", e);
      }
    }
    return request;
  }

  function processResponseWithMiddlewares<T extends FetchResponse<unknown, any>>(
    response: T
  ): T | Termination {
    for (const middleware of CONFIG.responseMiddlewares || []) {
      try {
        const middlewareResponse = middleware.fn(response);
        if (middlewareResponse === null) {
          return {
            status: 0,
            args: response.args,
            data: null,
            error: new Error(
              `Response terminated by middleware: ${middleware.name}`
            ),
          } as FetchResponseOfError as unknown as T;
        }
        response = middlewareResponse as T;
      } catch (e) {
        console.error("Response middleware error", e);
      }
    }
    return response;
  }

  type FetchOptions = {
    method: string;
    headers: Headers;
    body?: any;
    redirect: RequestRedirect;
  };

  type FetchArgs = {
    url: string;
    options: FetchOptions;
  }

  async function fetchJson<T extends FetchResponse<unknown, number>>(
    args: FetchArgs
  ): Promise<T> {
    const errorResponse = (error: StandardError, status: number, args: any) => {
      const errorResponse = {
        status: status as ErrorStatuses,
        args,
        data: null,
        error,
      } satisfies FetchResponse<T>;

      return processResponseWithMiddlewares(errorResponse) as unknown as T;
    };

    const errorStatus = (args: any) => {
      const errorResponse = {
        status: 0,
        args,
        data: null,
        error: new Error("Network error"),
      } as FetchResponse<T, Error500s>;

      return processResponseWithMiddlewares(errorResponse) as unknown as T;
    };

    try {
      const fetchRequest = processRequestWithMiddlewares(args);

      if ("termination" in fetchRequest) {
        const terminationResponse = {
          status: 0,
          args,
          data: null,
          error: new Error(
            `Request terminated by middleware: ${fetchRequest.termination.name}`
          ),
        } as FetchResponse<T, Error500s>;

        return processResponseWithMiddlewares(
          terminationResponse
        ) as unknown as T;
      }

      const fetchResponse: Response = await fetch(fetchRequest.url, fetchRequest.options);
      const status = fetchResponse.status;
      try {
        const json = await fetchResponse.json();
        const response = {
          data: json,
          status: fetchResponse.status,
          args,
          error: null,
          responseHeaders: fetchResponse.headers,
        };
        return processResponseWithMiddlewares(response) as unknown as T;
      } catch (error) {
        return errorResponse(error as StandardError, status, args);
      }
    } catch {
      return errorStatus(args);
    }
  }

  function getToken(): string | null | undefined {
    if (typeof CONFIG.jwtKey === "function") {
      return CONFIG.jwtKey();
    }

    if (typeof CONFIG.jwtKey === "string") {
      return localStorage.getItem(CONFIG.jwtKey);
    }

    return undefined;
  }
  
  function updateHeaders(headers: Headers) {
    if (!headers.has("Content-Type")) {
      headers.append("Content-Type", "application/json");
    }
    const token = getToken();
    if (!headers.has("Authorization") && token) {
      headers.append("Authorization", token);
    }
  };

function getQueryParamsString(paramsObject: ParamsObject = {}) {
	const queryString = Object.entries(paramsObject)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map(val => `${encodeURIComponent(key)}=${encodeURIComponent(
            val,
          )}`)
          .join('&');
      }
      // Handling non-array parameters
      return value !== undefined && value !== null 
        ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}` 
        : '';
    })
    .filter(part => part !== '')
    .join("&");

	return queryString.length > 0 ? `?${queryString}` : '';
}

function apiPost<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  const raw = JSON.stringify(request);

  updateHeaders(headers);

  const requestOptions: FetchOptions = {
    method: "POST",
    headers,
    body: raw,
    redirect: "follow",
  };

  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

type ParamsObject = {
  [key: string]: any;
};

function apiGet<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);
  
  const maybeQueryString = getQueryParamsString(paramsObject);

  const requestOptions: FetchOptions = {
    method: "GET",
    headers,
    redirect: "follow",
  };

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

function apiPut<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  const raw = JSON.stringify(request);

  const requestOptions: FetchOptions = {
    method: "PUT",
    headers,
    body: raw,
    redirect: "follow",
  };

  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

function apiDelete<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  const queryString = Object.entries(paramsObject)
    .filter(([_, val]) => val !== undefined && val !== null)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");
  
  const maybeQueryString = queryString.length > 0 ? `?${queryString}` : "";

  const requestOptions: FetchOptions = {
    method: "DELETE",
    headers,
    redirect: "follow",
  };

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

function apiPatch<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  const raw = JSON.stringify(request);

  const requestOptions: FetchOptions = {
    method: "PATCH",
    headers,
    body: raw,
    redirect: "follow",
  };
  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}
// INFRASTRUCTURE END

export type ApiResponse = {
	code: number;
	type: string;
	message: string;
};

export type Category = {
	id: number;
	name: string;
};

export type Pet = {
	id: number;
	category: Category;
	name: string;
	photoUrls: string[];
	tags: Tag[];
	status: "available" | "pending" | "sold";
};

export type Tag = {
	id: number;
	name: string;
};

export type Order = {
	id: number;
	petId: number;
	quantity: number;
	shipDate: string;
	status: "placed" | "approved" | "delivered";
	complete: boolean;
};

export type User = {
	id: number;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phone: string;
	userStatus: number;
};



export type PostPetPetIdUploadImageFetchResponse = 
| FetchResponse<ApiResponse, 200> 
| ErrorResponse;

export const postPetPetIdUploadImagePath = (petId: number) => `/pet/${petId}/uploadImage`;

export const postPetPetIdUploadImage = (petId: number, headers = new Headers()): 
	Promise<PostPetPetIdUploadImageFetchResponse> => {
	return apiPost(`${getApiUrl()}${postPetPetIdUploadImagePath(petId)}`, {}, headers) as Promise<PostPetPetIdUploadImageFetchResponse>;
}

export type PostPetFetchResponse = 
| FetchResponse<void, 405> 
| ErrorResponse;

export const postPetPath = () => `/pet`;

export const postPet = (requestContract: Pet, headers = new Headers()): 
	Promise<PostPetFetchResponse> => {
	return apiPost(`${getApiUrl()}${postPetPath()}`, requestContract, headers) as Promise<PostPetFetchResponse>;
}

export type PutPetFetchResponse = 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| FetchResponse<void, 405> 
| ErrorResponse;

export const putPetPath = () => `/pet`;

export const putPet = (requestContract: Pet, headers = new Headers()): 
	Promise<PutPetFetchResponse> => {
	return apiPut(`${getApiUrl()}${putPetPath()}`, requestContract, headers) as Promise<PutPetFetchResponse>;
}

export type GetPetFindByStatusFetchResponse = 
| FetchResponse<Pet[], 200> 
| FetchResponse<void, 400> 
| ErrorResponse;

export const getPetFindByStatusPath = () => `/pet/findByStatus`;

export const getPetFindByStatus = (status: string[], headers = new Headers()): 
	Promise<GetPetFindByStatusFetchResponse> => {
	const queryParams = {
		"status": status
	}
	return apiGet(`${getApiUrl()}${getPetFindByStatusPath()}`, headers, queryParams) as Promise<GetPetFindByStatusFetchResponse>;
}

export type GetPetFindByTagsFetchResponse = 
| FetchResponse<Pet[], 200> 
| FetchResponse<void, 400> 
| ErrorResponse;

export const getPetFindByTagsPath = () => `/pet/findByTags`;

export const getPetFindByTags = (tags: string[], headers = new Headers()): 
	Promise<GetPetFindByTagsFetchResponse> => {
	const queryParams = {
		"tags": tags
	}
	return apiGet(`${getApiUrl()}${getPetFindByTagsPath()}`, headers, queryParams) as Promise<GetPetFindByTagsFetchResponse>;
}

export type GetPetPetIdFetchResponse = 
| FetchResponse<Pet, 200> 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const getPetPetIdPath = (petId: number) => `/pet/${petId}`;

export const getPetPetId = (petId: number, headers = new Headers()): 
	Promise<GetPetPetIdFetchResponse> => {
	return apiGet(`${getApiUrl()}${getPetPetIdPath(petId)}`, headers, {}) as Promise<GetPetPetIdFetchResponse>;
}

export type DeletePetPetIdFetchResponse = 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const deletePetPetIdPath = (petId: number) => `/pet/${petId}`;

export const deletePetPetId = (petId: number, headers = new Headers()): 
	Promise<DeletePetPetIdFetchResponse> => {
	return apiDelete(`${getApiUrl()}${deletePetPetIdPath(petId)}`, headers, {}) as Promise<DeletePetPetIdFetchResponse>;
}

export type PostPetPetIdFetchResponse = 
| FetchResponse<void, 405> 
| ErrorResponse;

export const postPetPetIdPath = (petId: number) => `/pet/${petId}`;

export const postPetPetId = (petId: number, headers = new Headers()): 
	Promise<PostPetPetIdFetchResponse> => {
	return apiPost(`${getApiUrl()}${postPetPetIdPath(petId)}`, {}, headers) as Promise<PostPetPetIdFetchResponse>;
}

export type GetStoreInventoryFetchResponse = 
| FetchResponse<object, 200> 
| ErrorResponse;

export const getStoreInventoryPath = () => `/store/inventory`;

export const getStoreInventory = (headers = new Headers()): 
	Promise<GetStoreInventoryFetchResponse> => {
	return apiGet(`${getApiUrl()}${getStoreInventoryPath()}`, headers, {}) as Promise<GetStoreInventoryFetchResponse>;
}

export type PostStoreOrderFetchResponse = 
| FetchResponse<Order, 200> 
| FetchResponse<void, 400> 
| ErrorResponse;

export const postStoreOrderPath = () => `/store/order`;

export const postStoreOrder = (requestContract: Order, headers = new Headers()): 
	Promise<PostStoreOrderFetchResponse> => {
	return apiPost(`${getApiUrl()}${postStoreOrderPath()}`, requestContract, headers) as Promise<PostStoreOrderFetchResponse>;
}

export type GetStoreOrderOrderIdFetchResponse = 
| FetchResponse<Order, 200> 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const getStoreOrderOrderIdPath = (orderId: number) => `/store/order/${orderId}`;

export const getStoreOrderOrderId = (orderId: number, headers = new Headers()): 
	Promise<GetStoreOrderOrderIdFetchResponse> => {
	return apiGet(`${getApiUrl()}${getStoreOrderOrderIdPath(orderId)}`, headers, {}) as Promise<GetStoreOrderOrderIdFetchResponse>;
}

export type DeleteStoreOrderOrderIdFetchResponse = 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const deleteStoreOrderOrderIdPath = (orderId: number) => `/store/order/${orderId}`;

export const deleteStoreOrderOrderId = (orderId: number, headers = new Headers()): 
	Promise<DeleteStoreOrderOrderIdFetchResponse> => {
	return apiDelete(`${getApiUrl()}${deleteStoreOrderOrderIdPath(orderId)}`, headers, {}) as Promise<DeleteStoreOrderOrderIdFetchResponse>;
}

export type PostUserCreateWithListFetchResponse = 
| FetchResponse<void, 201> 
| ErrorResponse;

export const postUserCreateWithListPath = () => `/user/createWithList`;

export const postUserCreateWithList = (requestContract: User[], headers = new Headers()): 
	Promise<PostUserCreateWithListFetchResponse> => {
	return apiPost(`${getApiUrl()}${postUserCreateWithListPath()}`, requestContract, headers) as Promise<PostUserCreateWithListFetchResponse>;
}

export type GetUserUsernameFetchResponse = 
| FetchResponse<User, 200> 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const getUserUsernamePath = (username: string) => `/user/${username}`;

export const getUserUsername = (username: string, headers = new Headers()): 
	Promise<GetUserUsernameFetchResponse> => {
	return apiGet(`${getApiUrl()}${getUserUsernamePath(username)}`, headers, {}) as Promise<GetUserUsernameFetchResponse>;
}

export type DeleteUserUsernameFetchResponse = 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const deleteUserUsernamePath = (username: string) => `/user/${username}`;

export const deleteUserUsername = (username: string, headers = new Headers()): 
	Promise<DeleteUserUsernameFetchResponse> => {
	return apiDelete(`${getApiUrl()}${deleteUserUsernamePath(username)}`, headers, {}) as Promise<DeleteUserUsernameFetchResponse>;
}

export type PutUserUsernameFetchResponse = 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const putUserUsernamePath = (username: string) => `/user/${username}`;

export const putUserUsername = (requestContract: User, username: string, headers = new Headers()): 
	Promise<PutUserUsernameFetchResponse> => {
	return apiPut(`${getApiUrl()}${putUserUsernamePath(username)}`, requestContract, headers) as Promise<PutUserUsernameFetchResponse>;
}

export type GetUserLoginFetchResponse = 
| FetchResponse<string, 200> 
| FetchResponse<void, 400> 
| ErrorResponse;

export const getUserLoginPath = () => `/user/login`;

export const getUserLogin = (username: string, password: string, headers = new Headers()): 
	Promise<GetUserLoginFetchResponse> => {
	const queryParams = {
		"username": username,
		"password": password
	}
	return apiGet(`${getApiUrl()}${getUserLoginPath()}`, headers, queryParams) as Promise<GetUserLoginFetchResponse>;
}

export type GetUserLogoutFetchResponse = 
| FetchResponse<void, 200> 
| ErrorResponse;

export const getUserLogoutPath = () => `/user/logout`;

export const getUserLogout = (headers = new Headers()): 
	Promise<GetUserLogoutFetchResponse> => {
	return apiGet(`${getApiUrl()}${getUserLogoutPath()}`, headers, {}) as Promise<GetUserLogoutFetchResponse>;
}

export type PostUserCreateWithArrayFetchResponse = 
| FetchResponse<void, 201> 
| ErrorResponse;

export const postUserCreateWithArrayPath = () => `/user/createWithArray`;

export const postUserCreateWithArray = (requestContract: User[], headers = new Headers()): 
	Promise<PostUserCreateWithArrayFetchResponse> => {
	return apiPost(`${getApiUrl()}${postUserCreateWithArrayPath()}`, requestContract, headers) as Promise<PostUserCreateWithArrayFetchResponse>;
}

export type PostUserFetchResponse = 
| FetchResponse<void, 201> 
| ErrorResponse;

export const postUserPath = () => `/user`;

export const postUser = (requestContract: User, headers = new Headers()): 
	Promise<PostUserFetchResponse> => {
	return apiPost(`${getApiUrl()}${postUserPath()}`, requestContract, headers) as Promise<PostUserFetchResponse>;
}

