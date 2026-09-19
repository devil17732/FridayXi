import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Pencil, Plus, Trash2 } from "lucide-react";
import TeamForm from "@/components/TeamForm";

export default function Teams() {
  const [teams, setTeams] = useState(null);
  const [players, setPlayers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = () => {
    base44.entities.Team.list("-created_date", 200).then(setTeams).catch(() => setTeams([]));
  };
  useEffect(() => {
    load();
    base44.entities.Player.list("-created_date", 500).then(setPlayers).catch(() => {});
  }, []);

  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const activePlayers = players.filter((p) => p.is_active !== false);

  async function remove(t) {
    if (!window.confirm(`Delete team "${t.name}"?`)) return;
    await base44.entities.Team.delete(t.id);
    load();
  }

  if (!teams) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Teams</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> New team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No teams yet — save your regular line-ups here and pick them when creating a match.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((t) => {
            const ids = t.player_ids || [];
            const credits = ids.reduce((s, id) => s + (byId[id]?.credits || 0), 0);
            return (
              <Card key={t.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{t.name}</span>
                    <Badge variant="secondary">{ids.length} players</Badge>
                  </CardTitle>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Coins className="h-3 w-3" /> {credits.toFixed(1)} credits
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ids.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No players yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {ids.map((id) => (
                        <span key={id} className="rounded-md bg-muted px-2 py-1 text-xs">
                          {byId[id]?.name || "Unknown"}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${t.name}`}
                      onClick={() => {
                        setEditing(t);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      aria-label={`Delete ${t.name}`}
                      onClick={() => remove(t)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TeamForm
        team={editing}
        players={activePlayers}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={load}
      />
    </div>
  );
}
