import { Arguments } from 'yargs';
import assert from 'assert';
import path from 'path';
import yaml from 'js-yaml';
import fs from 'fs';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getGasAndFees, getConnectionInfo, txOutput } from '../../../util';

export const command = 'publish';

export const desc = 'Register record.';

export const builder = {
  'bond-id': {
    type: 'string'
  },
}

export const handler = async (argv: Arguments) => {
  const { txKey, filename, verbose, config } = argv;
  const { services: { cns: cnsConfig } } = getConfig(config as string)
  const { restEndpoint, gqlEndpoint, userKey, bondId, chainId } = getConnectionInfo(argv, cnsConfig);

  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(userKey, 'Invalid User Key.');
  assert(bondId, 'Invalid Bond ID.');
  assert(chainId, 'Invalid CNS Chain ID.');

  let file = null;
  if (filename) {
    file = path.join(process.cwd(), filename as string);
  } else {
    file = 0; // stdin
  }

  const { record } = await yaml.load(fs.readFileSync(file, 'utf-8')) as any;
  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  const result = await registry.setRecord({ privateKey: userKey, record, bondId }, txKey as string, fee);

  txOutput(result,JSON.stringify(result.data,undefined,2),argv.output,argv.verbose)
}
