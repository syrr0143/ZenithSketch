"use client";
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@liveblocks/react";
import LiveCursors from "./Cursor/LiveCursors";
import React, { useCallback, useEffect, useState } from "react";
import LiveCursorChat from "./Cursor/LiveCursorChat";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from "./Reactions/ReactionButton";
import FlyingReaction from "./Reactions/FlyinReaction";
import useInterval from "@/hooks/useInterval";


const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;
    const [reaction, setReaction] = useState<Reaction[]>([]);
    const broadcast = useBroadcastEvent();
    const [cursorState, setCursorState] = useState({
        mode: CursorMode.Hidden,
        previousMessage: "",
    });

    useInterval(() => {
        if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
            setReaction((reactions) => reactions.concat([{
                point: { x: cursor.x, y: cursor.y },
                value: cursorState.reaction,
                timestamp: Date.now(),
            }]));

            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: cursorState.reaction,
            });
        }
    }, 100)

    useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;
        setReaction((reactions) => reactions.concat([{
            point: { x: event.x, y: event.y },
            value: event.value,
            timestamp: Date.now(),
        }]));
    })

    const setReactions = useCallback((reaction: string) => {
        setCursorState({
            mode: CursorMode.Reaction,
            reaction, isPressed: true,
        });
    }, []);


    const handlePointerMove = useCallback(
        (event: React.PointerEvent) => {
            event.preventDefault();
            if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {

                const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
                const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
                updateMyPresence({ cursor: { x, y } });
            }
        },
        []
    );

    const handlePointerLeave = useCallback(() => {
        setCursorState({ mode: CursorMode.Hidden, previousMessage: "" });
        updateMyPresence({ cursor: null, message: null });
    }, [updateMyPresence]);

    const handlePointerUp = useCallback((event: React.PointerEvent) => {
        setCursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
        );
    }, [cursorState.mode]);

    const handlePointerDown = useCallback(
        (event: React.PointerEvent) => {
            event.preventDefault();
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
            updateMyPresence({ cursor: { x, y } });
            setCursorState((state: CursorState) =>
                cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
            );
        },
        [cursorState.mode, updateMyPresence]
    );

    useEffect(() => {
        const onkeyup = (e: KeyboardEvent) => {
            if (e.key === '/') {
                e.preventDefault();
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: "",
                });
            } else if (e.key === 'Escape') {
                updateMyPresence({ message: "" });
                setCursorState({ mode: CursorMode.Hidden });
            } else if (e.key === 'e') {
                setCursorState({
                    mode: CursorMode.ReactionSelector,
                });
            }
        };

        window.addEventListener('keyup', onkeyup);
        return () => window.removeEventListener('keyup', onkeyup);
    }, [updateMyPresence]);


    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
            className="bg-black flex justify-center items-center h-[100vh]"
        >
            <h1 className="text-emerald-500 text-3xl ">ZenithSketch - Creativity at its peak.</h1>
            {reaction.map((r) => (
                <FlyingReaction key={r.timestamp.toString}
                    x={r.point.x}
                    y={r.point.y}
                    timestamp={r.timestamp}
                    value={r.value} />
            ))}
            {cursor && (
                <LiveCursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />
            )}
            {cursorState.mode === CursorMode.ReactionSelector && (
                <ReactionSelector setReaction={setReactions} />
            )}
            <LiveCursors others={others} />
        </div>
    );
};

export default Live;
