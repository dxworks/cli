import {Question} from 'inquirer'

export interface CustomQuestion extends Question {
    [x: string]: any
}

export interface Suggestion {
    text: string,
    examples?: string[]
    fix?: {
        questions: CustomQuestion[],
        action: (value: any) => void
    }
    mandatory?: boolean
}

export interface ValidationResult {
    suggestions: Array<string | Suggestion>
    warnings: string[]
    errors: string[]
}
