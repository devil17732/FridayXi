import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function nextFriday() {
  const d = new Date();
  const diff = (5 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default function NewMatch() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    match_date: nextFriday(),
    start_time: "19:00",
    venue: "",
    overs_per_side: "10",
    credit_cap: "100",
    team_a_id: "",
    team_b_id: "",
    team_a_name: "",
    team_b_name: "",
    wide_no_ball_runs_counted: false,
    no_ball_free_hit: false,
  });
  const [teams, setTeams] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.entities.Team.list("-created_date", 200).then(setTeams).catch(() => setTeams([]));
  }, []);

  const teamA = teams.find((t) => t.id === form.team_a_id);
  const teamB = teams.find((t) => t.id === form.team_b_id);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onTeamPick = (side, v) => {
    if (v === "custom") {
      setForm((f) => ({ ...f, ["team_" + side + "_id"]: "" }));
      return;
    }
    const t = teams.find((x) => x.id === v);
    setForm((f) => ({ ...f, ["team_" + side + "_id"]: v, ["team_" + side + "_name"]: t?.name || "" }));
  };

  async function submit(e) {
    e.preventDefault();
    if (form.team_a_id && form.team_a_id === form.team_b_id) {
      setError("Pick two different teams");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const aName = teamA?.name || form.team_a_name.trim() || "Team A";
      const bName = teamB?.name || form.team_b_name.trim() || "Team B";
      const m = await base44.entities.Match.create({
        title: form.title.trim() || `${aName} vs ${bName}`,
        match_date: form.match_date,
        start_time: form.start_time,
        venue: form.venue.trim(),
        overs_per_side: Number(form.overs_per_side) || 10,
        credit_cap: Number(form.credit_cap) || 100,
        team_a_name: aName,
        team_b_name: bName,
        team_a_players: teamA?.player_ids || [],
        team_b_players: teamB?.player_ids || [],
        wide_no_ball_runs_counted: form.wide_no_ball_runs_counted,
        no_ball_free_hit: form.no_ball_free_hit,
        status: "draft",
      });
      navigate(`/matches/${m.id}`);
    } catch (err) {
      setError(err?.message || "Could not create the match");
      setSaving(false);
    }
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Create a Match</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nm-title">Match title</Label>
              <Input id="nm-title" value={form.title} onChange={set("title")} placeholder="Friday Match #1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nm-venue">Venue</Label>
              <Input id="nm-venue" value={form.venue} onChange={set("venue")} placeholder="Ground name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nm-date">Date</Label>
              <Input id="nm-date" type="date" value={form.match_date} onChange={set("match_date")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nm-time">Start time</Label>
              <Input id="nm-time" type="time" value={form.start_time} onChange={set("start_time")} required />
            </div>
            <div className="space-y-1.5">
              <Label>Team A</Label>
              <Select value={form.team_a_id || "custom"} onValueChange={(v) => onTeamPick("a", v)}>
                <SelectTrigger id="nm-team-a">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom — name & draft in match</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({(t.player_ids || []).length} players)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!form.team_a_id && (
                <Input value={form.team_a_name} onChange={set("team_a_name")} placeholder="Team A name" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Team B</Label>
              <Select value={form.team_b_id || "custom"} onValueChange={(v) => onTeamPick("b", v)}>
                <SelectTrigger id="nm-team-b">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom — name & draft in match</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({(t.player_ids || []).length} players)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!form.team_b_id && (
                <Input value={form.team_b_name} onChange={set("team_b_name")} placeholder="Team B name" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nm-overs">Overs per side</Label>
              <Input id="nm-overs" type="number" min="1" max="40" value={form.overs_per_side} onChange={set("overs_per_side")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nm-cap">Credit cap per team</Label>
              <Input id="nm-cap" type="number" min="10" max="200" value={form.credit_cap} onChange={set("credit_cap")} required />
            </div>
          </div>
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-semibold">Match rules</p>
            <div className="flex items-center justify-between">
              <Label htmlFor="nm-extras-runs" className="text-sm font-normal">
                Count runs from Wide / No ball
              </Label>
              <Switch
                id="nm-extras-runs"
                checked={form.wide_no_ball_runs_counted}
                onCheckedChange={(v) => setForm((f) => ({ ...f, wide_no_ball_runs_counted: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="nm-free-hit" className="text-sm font-normal">
                Free hit after a No ball
              </Label>
              <Switch
                id="nm-free-hit"
                checked={form.no_ball_free_hit}
                onCheckedChange={(v) => setForm((f) => ({ ...f, no_ball_free_hit: v }))}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? "Creating…" : teamA && teamB ? "Create match" : "Create & start drafting"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
