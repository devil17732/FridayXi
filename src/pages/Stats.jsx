import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Target, Zap } from "lucide-react";
import BattingStats from "@/components/stats/BattingStats";
import BowlingStats from "@/components/stats/BowlingStats";
import TotalStats from "@/components/stats/TotalStats";

export default function Stats() {
  const [players, setPlayers] = useState(null);

  useEffect(() => {
    base44.entities.Player.list("-created_date", 500).then(setPlayers).catch(() => setPlayers([]));
  }, []);

  if (!players) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    );
  }

  const topRun = [...players].sort((a, b) => (b.runs_scored || 0) - (a.runs_scored || 0))[0];
  const topWkt = [...players].sort((a, b) => (b.wickets_taken || 0) - (a.wickets_taken || 0))[0];
  const mostSixes = [...players].sort((a, b) => (b.sixes || 0) - (a.sixes || 0))[0];
  const econ = (p) => (p.balls_bowled ? (p.runs_conceded / (p.balls_bowled / 6)).toFixed(1) : "-");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Career Records</h1>

      {players.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No players yet — stats will appear here after your first match.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {topRun && (topRun.runs_scored || 0) > 0 && (
              <Card className="border-amber-500/40">
                <CardContent className="flex items-center gap-3 pt-6">
                  <Star className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Most runs</p>
                    <p className="font-semibold">{topRun.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {topRun.runs_scored} runs • HS {topRun.highest_score || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {topWkt && (topWkt.wickets_taken || 0) > 0 && (
              <Card className="border-sky-500/40">
                <CardContent className="flex items-center gap-3 pt-6">
                  <Target className="h-8 w-8 text-sky-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Most wickets</p>
                    <p className="font-semibold">{topWkt.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {topWkt.wickets_taken} wkts • Econ {econ(topWkt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {mostSixes && (mostSixes.sixes || 0) > 0 && (
              <Card className="border-violet-500/40">
                <CardContent className="flex items-center gap-3 pt-6">
                  <Zap className="h-8 w-8 text-violet-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Most sixes</p>
                    <p className="font-semibold">{mostSixes.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {mostSixes.sixes} sixes • {mostSixes.fours} fours
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Tabs defaultValue="batting">
            <TabsList>
              <TabsTrigger value="batting">Batting</TabsTrigger>
              <TabsTrigger value="bowling">Bowling</TabsTrigger>
              <TabsTrigger value="total">Total</TabsTrigger>
            </TabsList>
            <TabsContent value="batting">
              <BattingStats players={players} />
            </TabsContent>
            <TabsContent value="bowling">
              <BowlingStats players={players} />
            </TabsContent>
            <TabsContent value="total">
              <TotalStats players={players} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
