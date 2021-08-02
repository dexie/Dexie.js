import { h } from 'preact';
import { DXCGenericUserInteraction } from '../types/DXCUserInteraction';
import { DXCInputField } from '../types/DXCInputField';
export declare function LoginDialog({ title, alerts, fields, onCancel, onSubmit, }: DXCGenericUserInteraction<string, {
    [name: string]: DXCInputField;
}>): h.JSX.Element;
