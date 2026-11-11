import { mergeTests } from '@playwright/test'
import { test as apiTest } from './api'
import { test as mocksTest } from './mocks'
import { test as sessionTest } from './session'
import { test as uiTest } from './ui'

// Une las fixtures independientes (API, UI, mocks y sesiones).
// Las fixtures que combinan varias de ellas (actores) se definen sobre esta base.
export const test = mergeTests(apiTest, uiTest, mocksTest, sessionTest)
