import {ComponentNode} from '@/editor/componentNodeStore'


export const View:ComponentNode =  {
    id: 'hero',
    type: 'View',
    x: 0,
    y: 0,
    style: {
        flexDirection: 'row',
        borderColor: '#8d8d8d',
        width: 500,
        height: 200,
    },
    children: [],
}

export const Image:ComponentNode = {
    id: 'hero',
    type: 'View',
    x: 0,
    y: 0,
    style: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    content: '',
    children: [],
}

export const Text:ComponentNode = {
    id: 'hero',
    type: 'View',
    x: 0,
    y: 0,
    style: {
    },
    content: 'Text',
}

export const Button:ComponentNode = {
    id: 'hero',
    type: 'View',
    x: 0,
    y: 0,
    style: {},
    content: 'Button'
}