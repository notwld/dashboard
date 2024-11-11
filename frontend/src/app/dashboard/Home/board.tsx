import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader } from '../../../components/ui/card';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '../../../components/ui/dialog';
import { DialogHeader } from '../../../components/ui/Modal/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/Form/form';
import { Input } from '../../../components/ui/Sidebar/input';
import { Button } from '../../../components/ui/button';

// Draggable Card Component
function Draggable({ id, children }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        color: 'white',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="mb-2">
            <Card className='text-white'>
                <CardContent className='text-white'>{children}</CardContent>
            </Card>
        </div>
    );
}

// Droppable Column Component
function Droppable({ id, children }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const style = {
        opacity: isOver ? 1 : 0.5,
        border: '1px solid #ddd',
        borderRadius: '8px',
        color:"white",
        padding: '10px',
        minHeight: '200px',
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children}
        </div>
    );
}

// Board Component with multiple columns
function Board() {
    const [columns, setColumns] = useState({
        todo: [],
        inProgress: [],
        done: [],
    });
    const [form, setForm] = useState({
        title: '',
        description: ''
    });

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        const fromColumn = Object.keys(columns).find((column) =>
            columns[column].includes(active.id)
        );
        const toColumn = over.id;

        if (fromColumn !== toColumn) {
            setColumns((prev) => {
                const newColumns = { ...prev };
                // Remove item from source column
                newColumns[fromColumn] = newColumns[fromColumn].filter(
                    (item) => item !== active.id
                );
                // Add item to destination column
                newColumns[toColumn] = [...newColumns[toColumn], active.id];
                return newColumns;
            });
        }
    };

    const renderDraggableCards = (columnId) => {
        return columns[columnId].map((card) => (
            <Draggable key={card} id={card}>
                <div className='z-10 '>
                <CardHeader className='ring-0 text-white p-0 py-3'><span className='text-2xl'> {card.title}</span>
                <CardDescription className='ring-0 text-[18px] text-white'>{card.description}</CardDescription>
                </CardHeader>
                
                </div>
            </Draggable>
        ));
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex space-x-4">
                {/* To Do Column */}
                <div className="w-1/3">
                    <Droppable id="todo">
                        <div className="flex w-full justify-between items-center mb-3">
                            <h3 className='text-lg'>To Do</h3>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <span className='text-[19px] cursor-pointer'>
                                        + Add Task
                                    </span>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Task</DialogTitle>
                                        <DialogDescription>
                                            Enter the task details below
                                            <div>
                                                <input type="text" placeholder='Task Name' className='w-full border p-2 rounded-lg mt-2 ring-2 bg-transparent' value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                                                <textarea placeholder='Task Description' className='w-full border p-2 rounded-lg mt-2  ring-2 bg-transparent'
                                                    value={form.description}
                                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                ></textarea>
                                                <DialogClose>
                                                    <Button className='mt-2'
                                                        onClick={() => {
                                                            setColumns((prev) => {
                                                                const newColumns = { ...prev };
                                                                newColumns['todo'] = [...newColumns['todo'], { title: form.title, description: form.description }];
                                                                return newColumns;

                                                            });
                                                        }}

                                                    >Add Task</Button>
                                                </DialogClose>

                                            </div>


                                        </DialogDescription>
                                    </DialogHeader>

                                </DialogContent>

                            </Dialog>
                        </div>
                        <ScrollArea className='h-[500px]'>
                            {renderDraggableCards('todo')}
                        </ScrollArea>
                    </Droppable>
                </div>

                {/* In Progress Column */}
                <div className="w-1/3">
                    <Droppable id="inProgress">
                        <h3>In Progress</h3>
                        <ScrollArea className='h-[500px] mt-3'>

                            {renderDraggableCards('inProgress')}
                        </ScrollArea>
                    </Droppable>
                </div>

                {/* Done Column */}
                <div className="w-1/3">
                    <Droppable id="done">
                        <h3>Done</h3>
                        <ScrollArea className='h-[500px] mt-3'>

                            {renderDraggableCards('done')}
                        </ScrollArea>
                    </Droppable>
                </div>
            </div>
        </DndContext>
    );
}

export default Board;
