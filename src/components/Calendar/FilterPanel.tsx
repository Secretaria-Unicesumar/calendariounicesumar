import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getModuleColor } from "@/utils/csvParser";

interface FilterPanelProps {
  modulos: string[];
  categorias: string[];
  produtos: string[]; // modalidades / produtos
  selectedModulos: string[];
  selectedCategorias: string[];
  selectedProdutos: string[]; // modalidades selecionadas
  onModuloToggle: (modulo: string) => void;
  onCategoriaToggle: (categoria: string) => void;
  onProdutoToggle: (produto: string) => void; // toggle modalidade
  onClearFilters: () => void;
}

export const FilterPanel = ({
  modulos,
  categorias,
  produtos,
  selectedModulos,
  selectedCategorias,
  selectedProdutos,
  onModuloToggle,
  onCategoriaToggle,
  onProdutoToggle,
  onClearFilters,
}: FilterPanelProps) => {
  const hasFilters = selectedModulos.length > 0 || selectedCategorias.length > 0 || selectedProdutos.length > 0;
  
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-foreground" />
          <h3 className="font-bold text-lg text-foreground">Filtros</h3>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Modalidade</h4>
            <div className="space-y-2">
              {produtos.map((produto) => (
                <div key={produto} className="flex items-center space-x-2">
                  <Checkbox
                    id={`produto-${produto}`}
                    checked={selectedProdutos.includes(produto)}
                    onCheckedChange={() => onProdutoToggle(produto)}
                  />
                  <label
                    htmlFor={`produto-${produto}`}
                    className="text-sm cursor-pointer text-foreground flex-1"
                  >
                    {produto}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Módulos</h4>
            <div className="space-y-2">
              {modulos.map((modulo) => (
                <div key={modulo} className="flex items-center space-x-2">
                  <Checkbox
                    id={`modulo-${modulo}`}
                    checked={selectedModulos.includes(modulo)}
                    onCheckedChange={() => onModuloToggle(modulo)}
                  />
                  <label
                    htmlFor={`modulo-${modulo}`}
                    className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getModuleColor(modulo, modulos) }}
                    />
                    <span className="text-foreground">{modulo}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Categorias</h4>
            <div className="space-y-2">
              {categorias.map((categoria) => (
                <div key={categoria} className="flex items-center space-x-2">
                  <Checkbox
                    id={`categoria-${categoria}`}
                    checked={selectedCategorias.includes(categoria)}
                    onCheckedChange={() => onCategoriaToggle(categoria)}
                  />
                  <label
                    htmlFor={`categoria-${categoria}`}
                    className="text-sm cursor-pointer text-foreground flex-1"
                  >
                    {categoria}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
