import { text } from '@sveltejs/kit';
import chalk from 'chalk';

enum Side {
	SERVER = '@',
	CLIENT = '#',
	UNSURE = '$'
}

enum Type {
	OK = '+',
	WARN = '*',
	ERROR = '-'
}

enum From {
	MODULE = 'M',
	ROUTER = 'R',
	TRANSLATION_MODULE = 'TR'
}

interface LogOptions {
	side: Side;
	type: Type;
	from: From;
	message: string;
}

function colorize(input: Side | Type) {
	switch (input) {
		case Side.SERVER:
			return chalk.cyanBright(input);

		case Side.CLIENT:
			return input;

		case Side.UNSURE:
			return input;

		case Type.OK:
			return chalk.greenBright(input);

		case Type.WARN:
			return chalk.yellowBright(input);

		case Type.ERROR:
			return chalk.redBright(input);

		default:
			return input;
	}
}

export function log(options: LogOptions) {
	let text = '';

	if (options.side === Side.SERVER) {
		text += `{${colorize(options.side)}}`;
		text += `[${colorize(options.type)}]`;
		text += `(${options.from})`;
		text += ` `;
		text += `${options.message}`;
	} else {
		text += `{${options.side}}`;
		text += `[${options.type}]`;
		text += `(${options.from})`;
		text += ` `;
		text += `${options.message}`;
	}

	console.log(text);
}

export { Side as LogSide, Type as LogType, From as LogFrom };
