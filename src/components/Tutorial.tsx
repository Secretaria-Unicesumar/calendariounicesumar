import { HelpCircle, Calendar, Grid3x3, List, Filter, MousePointerClick, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Tutorial() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Tutorial
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-calendar-header">
            Como utilizar o Calendário Acadêmico
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Seção 1: Modos de Visualização */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Modos de Visualização
              </h3>
              <div className="space-y-3 pl-7">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Mês</p>
                    <p className="text-sm text-muted-foreground">
                      Visualize os eventos de um mês específico em formato de calendário. 
                      Os dias com eventos são destacados com cores que representam os módulos.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded">
                    <Grid3x3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Ano</p>
                    <p className="text-sm text-muted-foreground">
                      Visualize todos os 12 meses do ano de uma vez. Útil para ter uma 
                      visão geral do calendário acadêmico. Clique em um mês para abri-lo na visão mensal.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded">
                    <List className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Lista</p>
                    <p className="text-sm text-muted-foreground">
                      Visualize todos os eventos em formato de lista organizada por data. 
                      Ideal para buscar eventos específicos ou exportar informações.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 2: Filtros */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Painel de Filtros
              </h3>
              <div className="pl-7 space-y-2">
                <p className="text-sm text-muted-foreground">
                  No painel lateral esquerdo, você pode filtrar os eventos por:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong>Produto:</strong> Graduação EAD, Pós-graduação, Técnico, etc.</li>
                  <li><strong>Módulo:</strong> Período acadêmico específico (ex: 2026-51, 2026-52)</li>
                  <li><strong>Categoria:</strong> Tipo de atividade (Matrícula, Aproveitamento, etc.)</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Clique nas opções para ativá-las ou desativá-las. Você pode combinar múltiplos 
                  filtros. Para limpar todos os filtros, use o botão "Limpar filtros".
                </p>
              </div>
            </section>

            {/* Seção 3: Selecionando Datas */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MousePointerClick className="h-5 w-5 text-primary" />
                Visualizando Detalhes do Dia
              </h3>
              <div className="pl-7 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Nas visualizações de Mês ou Ano, clique em qualquer dia do calendário para 
                  ver todos os eventos daquele dia no painel lateral direito.
                </p>
                <p className="text-sm text-muted-foreground">
                  O painel de detalhes mostrará:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Nome da atividade</li>
                  <li>Módulo e categoria</li>
                  <li>Data de início e fim</li>
                  <li>Observações, quando houver</li>
                </ul>
              </div>
            </section>

            {/* Seção 4: Navegação */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <div className="flex">
                  <ChevronLeft className="h-5 w-5 text-primary" />
                  <ChevronRight className="h-5 w-5 text-primary" />
                </div>
                Navegação
              </h3>
              <div className="pl-7 space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Na visão de Mês:</strong> Use as setas para navegar entre os meses. 
                  Você também pode clicar no nome do mês para selecionar um mês específico.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Na visão de Ano:</strong> Use as setas para navegar entre os anos. 
                  Clique em qualquer mês para abri-lo na visão mensal.
                </p>
              </div>
            </section>

            {/* Seção 5: Cores */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <div className="w-4 h-4 rounded bg-orange-500" />
                </div>
                Código de Cores
              </h3>
              <div className="pl-7 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Cada módulo possui uma cor única que é consistente em todas as visualizações 
                  do calendário. Isso facilita a identificação rápida de eventos relacionados 
                  ao mesmo módulo acadêmico.
                </p>
                <p className="text-sm text-muted-foreground">
                  A cor de cada módulo é exibida tanto no painel de filtros quanto nos eventos 
                  do calendário.
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
