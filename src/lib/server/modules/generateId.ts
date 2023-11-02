/**
 * This module is response for generating random and unique id
*/

import { v4 as uuidv4 } from 'uuid';

export default function generateId() {
    return uuidv4();
}