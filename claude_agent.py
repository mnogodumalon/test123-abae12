# lilo_agent.py
import asyncio
import json
# Wir importieren jetzt die Klasse statt der Funktion
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, AssistantMessage, ToolUseBlock, TextBlock, ResultMessage

async def main():
    # 1. Metadaten lesen (wurde vom Server hochgeladen)
    try:
        with open("/home/user/app/CLAUDE.md", "r") as f:
            instructions = f.read()
    except:
        print("Kein CLAUDE.md")

    # 3. Optionen konfigurieren
    options = ClaudeAgentOptions(
        # Das Preset aktiviert die "Coding Intelligence"
        system_prompt={
            "type": "preset",
            "preset": "claude_code",
            "append": instructions
        },
        # Wir sind in der Sandbox -> Volle Rechte!
        permission_mode="acceptEdits",
        allowed_tools=["Bash", "Write", "Read", "Edit", "Glob", "Grep"],
        # WICHTIG: Damit er weiß, wo das Projekt liegt
        cwd="/home/user/app",
        model="claude-sonnet-4-5-20250929"
    )

    print(f"[LILO] Initialisiere Client")

    # 4. Der Client Lifecycle
    # 'async with' kümmert sich um connect() und disconnect()
    async with ClaudeSDKClient(options=options) as client:
        
        # Anfrage senden
        await client.query("Baue das Dashboard")

        # 5. Antwort-Schleife (Hier sehen wir, was er tut)
        # receive_response() liefert alles bis zum Ende des Auftrags
        async for message in client.receive_response():
            
            # A. Wenn er denkt oder spricht
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        # Wir geben das als JSON-Zeile aus, damit dein FastAPI es leicht parsen kann
                        print(json.dumps({"type": "think", "content": block.text}), flush=True)
                    
                    elif isinstance(block, ToolUseBlock):
                        print(json.dumps({"type": "tool", "tool": block.name, "input": str(block.input)}), flush=True)

            # B. Wenn er fertig ist (oder Fehler)
            elif isinstance(message, ResultMessage):
                status = "success" if not message.is_error else "error"
                print(json.dumps({"type": "result", "status": status, "cost": message.total_cost_usd}), flush=True)

if __name__ == "__main__":
    asyncio.run(main())