# Codigos-Base para a Pratica (10 opcoes)

Use um unico codigo-base por grupo.
Depois de escolher, use o mesmo codigo em todas as fases de prompt para manter comparabilidade.

---

## CB01 - Carrinho de Compras (descontos por tipo)

```java
public class OrderProcessor {
    public double process(java.util.List<Product> pList, int cType, boolean flag) {
        double t = 0.0;
        if (pList != null && pList.size() > 0) {
            for (int i = 0; i < pList.size(); i++) {
                Product p = pList.get(i);
                if (p.getStatus() == 1) {
                    if (cType == 2) {
                        t = t + (p.getVal() * 0.85);
                    } else if (cType == 1 && flag) {
                        t = t + (p.getVal() * 0.90);
                    } else {
                        t = t + p.getVal();
                    }
                }
            }
        }
        return t;
    }
}
```

---

## CB02 - Folha de Pagamento (bonus e desconto)

```java
public class PayrollService {
    public double calc(java.util.List<Employee> eList, int m, boolean b) {
        double r = 0;
        if (eList != null) {
            for (Employee e : eList) {
                if (e.getA() == 1) {
                    double s = e.getS();
                    if (m == 12) {
                        r += s * 1.2;
                    } else if (b && e.getT() == 3) {
                        r += s * 1.1;
                    } else {
                        r += s;
                    }
                }
            }
        }
        return r;
    }
}
```

---

## CB03 - Frete de Pedido (cidade e urgencia)

```java
public class ShippingCalc {
    public double run(java.util.List<Order> o, int z, boolean x) {
        double v = 0;
        if (o != null && o.size() > 0) {
            for (Order i : o) {
                if (i.getSt() == 1) {
                    if (z == 1) {
                        v += i.getW() * 2.5;
                    } else if (z == 2 && x) {
                        v += i.getW() * 1.8;
                    } else {
                        v += i.getW() * 3.0;
                    }
                }
            }
        }
        return v;
    }
}
```

---

## CB04 - Controle de Estoque (ajuste por categoria)

```java
public class InventoryManager {
    public int upd(java.util.List<Item> it, int k, boolean f) {
        int q = 0;
        if (it != null) {
            for (int i = 0; i < it.size(); i++) {
                Item a = it.get(i);
                if (a.getS() == 1) {
                    if (k == 2) {
                        q += a.getQ() + 5;
                    } else if (k == 1 && f) {
                        q += a.getQ() + 2;
                    } else {
                        q += a.getQ();
                    }
                }
            }
        }
        return q;
    }
}
```

---

## CB05 - Notas de Alunos (pesos e recuperacao)

```java
public class GradeProcessor {
    public double p(java.util.List<Student> l, int t, boolean r) {
        double m = 0;
        int c = 0;
        if (l != null) {
            for (Student s : l) {
                if (s.getAt() == 1) {
                    if (t == 2) {
                        m += s.getG() * 1.1;
                    } else if (t == 1 && r) {
                        m += s.getG() * 1.05;
                    } else {
                        m += s.getG();
                    }
                    c++;
                }
            }
        }
        return c == 0 ? 0 : m / c;
    }
}
```

---

## CB06 - Faturas em Atraso (juros e multa)

```java
public class BillingService {
    public double doIt(java.util.List<Invoice> x, int d, boolean vip) {
        double total = 0;
        if (x != null && !x.isEmpty()) {
            for (Invoice i : x) {
                if (i.getS() == 1) {
                    if (d > 30) {
                        total += i.getV() * 1.15;
                    } else if (d > 10 && vip) {
                        total += i.getV() * 1.05;
                    } else {
                        total += i.getV();
                    }
                }
            }
        }
        return total;
    }
}
```

---

## CB07 - Agendamento de Consultas (prioridade)

```java
public class AppointmentService {
    public int make(java.util.List<Patient> p, int pr, boolean fast) {
        int n = 0;
        if (p != null) {
            for (Patient a : p) {
                if (a.getS() == 1) {
                    if (pr == 3) {
                        n += 3;
                    } else if (pr == 2 && fast) {
                        n += 2;
                    } else {
                        n += 1;
                    }
                }
            }
        }
        return n;
    }
}
```

---

## CB08 - Pontuacao de Entrega (qualidade)

```java
public class DeliveryScore {
    public double calc(java.util.List<Delivery> d, int t, boolean rain) {
        double s = 0;
        if (d != null) {
            for (Delivery e : d) {
                if (e.getOk() == 1) {
                    if (t == 1) {
                        s += 10;
                    } else if (t == 2 && !rain) {
                        s += 8;
                    } else {
                        s += 5;
                    }
                }
            }
        }
        return s;
    }
}
```

---

## CB09 - Fidelidade de Cliente (pontos e promocao)

```java
public class LoyaltyEngine {
    public int run(java.util.List<Customer> c, int lvl, boolean promo) {
        int p = 0;
        if (c != null && c.size() > 0) {
            for (Customer u : c) {
                if (u.getA() == 1) {
                    if (lvl == 3) {
                        p += u.getSpent() / 5;
                    } else if (lvl == 2 && promo) {
                        p += u.getSpent() / 8;
                    } else {
                        p += u.getSpent() / 10;
                    }
                }
            }
        }
        return p;
    }
}
```

---

## CB10 - Consumo de Energia (faixa e bandeira)

```java
public class EnergyBill {
    public double c(java.util.List<Meter> m, int f, boolean red) {
        double t = 0;
        if (m != null) {
            for (Meter k : m) {
                if (k.getS() == 1) {
                    if (f == 2) {
                        t += k.getKw() * 0.92;
                    } else if (f == 1 && red) {
                        t += k.getKw() * 1.08;
                    } else {
                        t += k.getKw() * 1.00;
                    }
                }
            }
        }
        return t;
    }
}
```

---

