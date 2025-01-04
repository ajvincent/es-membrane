import type {
	JsonPrimitive,
} from 'type-fest';

import type {
	WriterFunction,
} from "ts-morph";

type JsonifiableObjectOrWriter = {[Key in string]?: JsonifiableOrWriter} | {toJSON: () => JsonifiableOrWriter};
type JsonifiableArrayOrWriter = readonly JsonifiableOrWriter[];

export type JsonifiableOrWriter = JsonPrimitive | JsonifiableObjectOrWriter | JsonifiableArrayOrWriter | WriterFunction;

type stringOrWriterFunction = string | WriterFunction;

type ReplaceWriterWithStringBase<T> = (
	T extends stringOrWriterFunction[] ? {[Ix in keyof T]: ReplaceWriterWithStringBase<T[Ix]>} :
	T extends WriterFunction ? Exclude<T, WriterFunction> | string :
	T
);

export type ReplaceWriterInProperties<T extends object> = {
	[key in keyof T]: ReplaceWriterWithStringBase<T[key]>;
}
